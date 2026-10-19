"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  CircleGeometry,
  Color,
  Euler,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  MathUtils,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
  type Group,
} from "three";
import { usePortfolio } from "@/lib/store";
import { canvasTexture, makeCanvas, rng, tileNoise } from "./procedural";

const POT_H = 0.222;
const SOIL_Y = 0.188;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function potGeometry() {
  // Solid on the left of travel so normals face out.
  const pts: [number, number][] = [
    [0, 0],
    [0.156, 0],
    [0.163, 0.006],
  ];
  const N = 10;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    pts.push([0.165 + 0.033 * t, 0.006 + (POT_H - 0.012) * t]);
  }
  pts.push([0.1995, POT_H - 0.002], [0.197, POT_H + 0.001], [0.189, POT_H + 0.0015], [0.184, POT_H - 0.002]);
  pts.push([0.181, POT_H - 0.02], [0.176, SOIL_Y - 0.01], [0, SOIL_Y - 0.01]);
  return new LatheGeometry(
    pts.map(([r, y]) => new Vector2(r, y)),
    64,
  );
}

function concreteTexture() {
  const S = 256;
  const { canvas, ctx } = makeCanvas(S, S);
  const { noise2 } = tileNoise(41);
  const rand = rng(43);
  const img = ctx.createImageData(S, S);
  const d = img.data;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = noise2(x / 32, y / 32, 8, 8) * 0.6 + noise2(x / 8, y / 8, 32, 32) * 0.4;
      const v = 0.88 + (n - 0.5) * 0.16 + (rand() - 0.5) * 0.06;
      const o = (y * S + x) * 4;
      d[o] = 150 * v;
      d[o + 1] = 145 * v;
      d[o + 2] = 137 * v;
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // Air pockets
  for (let i = 0; i < 450; i++) {
    const r = 0.4 + rand() * 1.0;
    ctx.fillStyle = `rgba(40,38,35,${0.25 + rand() * 0.4})`;
    ctx.beginPath();
    ctx.arc(rand() * S, rand() * S, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(canvas, { color: true, repeat: [3, 1], anisotropy: 4 });
}

function soilTexture() {
  const S = 256;
  const { canvas, ctx } = makeCanvas(S, S);
  const rand = rng(51);
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const l = rand();
    ctx.fillStyle = l > 0.7 ? "rgba(92,70,50,0.6)" : l > 0.35 ? "rgba(48,34,24,0.7)" : "rgba(8,5,3,0.7)";
    ctx.beginPath();
    ctx.arc(rand() * S, rand() * S, 0.6 + rand() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(canvas, { color: true, anisotropy: 2 });
}

// Echeveria leaf: base at the origin, pointing +Z, top facing +Y.
function leafGeometry() {
  const geo = new SphereGeometry(1, 22, 16);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const base = new Color("#dbe6cc");
  const body = new Color("#a3c2b8");
  const tip = new Color("#e09a94");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);
    const t = (sy + 1) / 2;
    // Spoon shape: narrow base, broad shoulders, short pointed tip
    const w = MathUtils.lerp(0.34, 1, smooth(0, 0.62, t)) * (1 - Math.pow(smooth(0.7, 1, t), 2.2));
    const th = 0.23 * (1 - 0.4 * t) * Math.min(1, w * 1.6 + 0.1);
    const x = sx * 0.52 * w;
    // Edges curl up to cup the top; tip lifts a little
    const y = sz * th + 1.4 * x * x + 0.08 * t * t;
    pos.setXYZ(i, x, y, t);

    const edge = Math.min(1, Math.abs(sx) / Math.max(0.05, Math.sqrt(Math.max(0, 1 - sy * sy))));
    c.copy(base).lerp(body, smooth(0.0, 0.45, t));
    const blush = Math.min(1, smooth(0.8, 1, t) * 0.95 + smooth(0.75, 1, edge) * smooth(0.4, 1, t) * 0.5);
    c.lerp(tip, blush);
    if (sz < 0) c.lerp(base, 0.25); // paler underside
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

const LEAVES = 40;

function rosette(material: MeshPhysicalMaterial) {
  const geo = leafGeometry();
  const mesh = new InstancedMesh(geo, material, LEAVES);
  const rand = rng(61);
  const m = new Matrix4();
  const q = new Quaternion();
  const e = new Euler(0, 0, 0, "YXZ");
  const p = new Vector3();
  const s = new Vector3();
  // Instance colours multiply the vertex colours, so keep them near white.
  const inner = new Color("#f4fbe9");
  const outer = new Color("#e6eef2");
  const col = new Color();
  for (let i = 0; i < LEAVES; i++) {
    // i = 0 is the outermost leaf
    const k = 1 - i / (LEAVES - 1);
    const len = 0.04 + 0.125 * Math.pow(k, 0.8);
    const elev = MathUtils.degToRad(MathUtils.lerp(80, 20, Math.pow(k, 0.8)) + (rand() - 0.5) * 6);
    const az = i * GOLDEN + (rand() - 0.5) * 0.12;
    const r = 0.008 + 0.05 * Math.pow(k, 1.15);
    p.set(Math.sin(az) * r, SOIL_Y + 0.018 + 0.03 * (1 - k), Math.cos(az) * r);
    e.set(-elev, az, (rand() - 0.5) * 0.12);
    q.setFromEuler(e);
    const w = 1 + (rand() - 0.5) * 0.12;
    s.set(len * w * 1.05, len, len);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
    col.copy(outer).lerp(inner, Math.pow(1 - k, 1.2));
    col.offsetHSL((rand() - 0.5) * 0.015, 0, (rand() - 0.5) * 0.04);
    mesh.setColorAt(i, col);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, geo };
}

function pebbles(material: MeshStandardMaterial) {
  const COUNT = 46;
  const geo = new IcosahedronGeometry(1, 1);
  const mesh = new InstancedMesh(geo, material, COUNT);
  const rand = rng(71);
  const m = new Matrix4();
  const q = new Quaternion();
  const e = new Euler();
  const p = new Vector3();
  const s = new Vector3();
  const col = new Color();
  for (let i = 0; i < COUNT; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.07 + Math.sqrt(rand()) * 0.1;
    const size = 0.006 + rand() * 0.008;
    p.set(Math.cos(a) * r, SOIL_Y + size * 0.3, Math.sin(a) * r);
    e.set(rand() * 3, rand() * 3, rand() * 3);
    q.setFromEuler(e);
    s.set(size * (1 + rand() * 0.4), size * 0.6, size);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
    col.set(rand() > 0.5 ? "#8c8780" : "#b4aa9a").offsetHSL(0, 0, (rand() - 0.5) * 0.12);
    mesh.setColorAt(i, col);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, geo };
}

export function Plant({ position }: { position: readonly [number, number] }) {
  const [x, z] = position;
  const sway = useRef<Group>(null);
  const time = useRef(0);

  const res = useMemo(() => {
    const concrete = concreteTexture();
    const soil = soilTexture();
    const potMat = new MeshStandardMaterial({ map: concrete, roughness: 0.92, metalness: 0 });
    const soilMat = new MeshStandardMaterial({ map: soil, roughness: 1 });
    const leafMat = new MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.55,
      sheen: 0.6,
      sheenColor: new Color("#e4eee8"),
      sheenRoughness: 0.55,
    });
    const pebbleMat = new MeshStandardMaterial({ roughness: 0.75 });
    const pot = potGeometry();
    const soilDisc = new CircleGeometry(0.178, 40).rotateX(-Math.PI / 2);
    const leaves = rosette(leafMat);
    const stones = pebbles(pebbleMat);
    return {
      pot,
      soilDisc,
      potMat,
      soilMat,
      leaves: leaves.mesh,
      stones: stones.mesh,
      dispose: () => {
        concrete.dispose();
        soil.dispose();
        potMat.dispose();
        soilMat.dispose();
        leafMat.dispose();
        pebbleMat.dispose();
        pot.dispose();
        soilDisc.dispose();
        leaves.geo.dispose();
        stones.geo.dispose();
        leaves.mesh.dispose();
        stones.mesh.dispose();
      },
    };
  }, []);

  useEffect(() => () => res.dispose(), [res]);

  useFrame((_, delta) => {
    const g = sway.current;
    if (!g || usePortfolio.getState().reducedMotion) return;
    time.current += Math.min(delta, 0.1);
    const t = time.current;
    g.rotation.x = Math.sin(t * 0.55) * 0.008;
    g.rotation.z = Math.sin(t * 0.43 + 1.3) * 0.01;
  });

  return (
    <group position={[x, 0, z]} rotation-y={0.4}>
      <mesh geometry={res.pot} material={res.potMat} castShadow receiveShadow />
      <mesh geometry={res.soilDisc} material={res.soilMat} position-y={SOIL_Y} receiveShadow />
      <primitive object={res.stones} />
      <group ref={sway} position-y={SOIL_Y}>
        <primitive object={res.leaves} position-y={-SOIL_Y} />
      </group>
    </group>
  );
}
