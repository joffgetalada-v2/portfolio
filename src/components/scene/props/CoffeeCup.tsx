"use client";

import { useEffect, useMemo } from "react";
import {
  CatmullRomCurve3,
  CircleGeometry,
  LatheGeometry,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Texture,
} from "three";
import { canvasTexture, makeCanvas, rng } from "./procedural";
import { Steam } from "./Steam";

// Lathe profiles keep the solid on the left of travel so normals face outward.

const CUP_H = 0.235;
const SAUCER_TOP = 0.016;
const COFFEE_Y = 0.207;
const WALL = (s: number) => 0.009 + 0.006 * (1 - s);

// Outer radius at height y.
function cupOuter(y: number) {
  const s = Math.min(1, Math.max(0, (y - 0.006) / (CUP_H - 0.006)));
  return { r: 0.1 + 0.1 * (1 - Math.pow(1 - s, 2.4)), s };
}
const cupInner = (y: number) => {
  const { r, s } = cupOuter(y);
  return r - WALL(s);
};

function cupGeometry() {
  const pts: Vector2[] = [
    new Vector2(0, 0.006),
    new Vector2(0.07, 0.006),
    new Vector2(0.075, 0.0),
    new Vector2(0.092, 0.0),
    new Vector2(0.098, 0.004),
  ];
  const N = 22;
  for (let i = 1; i <= N; i++) {
    const y = 0.006 + ((CUP_H - 0.006) * i) / N;
    pts.push(new Vector2(cupOuter(y).r, y));
  }
  // Rounded lip.
  const lip = [
    [0.1985, 0.2392],
    [0.1957, 0.2412],
    [0.1925, 0.2398],
    [0.191, CUP_H - 0.002],
  ];
  for (const [r, y] of lip) pts.push(new Vector2(r, y));
  for (let i = 1; i <= N; i++) {
    const y = CUP_H - 0.004 - ((CUP_H - 0.004 - 0.045) * i) / N;
    pts.push(new Vector2(cupInner(y), y));
  }
  pts.push(new Vector2(0.09, 0.032), new Vector2(0.05, 0.027), new Vector2(0, 0.026));
  return new LatheGeometry(pts, 72);
}

function saucerGeometry() {
  const pts = [
    [0, 0.005],
    [0.1, 0.005],
    [0.106, 0.0],
    [0.124, 0.0],
    [0.13, 0.008],
    [0.17, 0.014],
    [0.24, 0.024],
    [0.3, 0.035],
    [0.333, 0.043],
    [0.341, 0.047],
    [0.3425, 0.051],
    [0.339, 0.0545],
    [0.331, 0.0535],
    [0.315, 0.047],
    [0.27, 0.036],
    [0.2, 0.026],
    [0.13, 0.018],
    [0.11, SAUCER_TOP],
    [0, SAUCER_TOP],
  ].map(([r, y]) => new Vector2(r, y));
  return new LatheGeometry(pts, 72);
}

function handleGeometry() {
  const top = 0.2;
  const bottom = 0.07;
  const curve = new CatmullRomCurve3([
    new Vector3(cupOuter(top).r - 0.008, top, 0),
    new Vector3(0.24, top + 0.006, 0),
    new Vector3(0.282, 0.182, 0),
    new Vector3(0.292, 0.138, 0),
    new Vector3(0.272, 0.095, 0),
    new Vector3(0.222, 0.074, 0),
    new Vector3(cupOuter(bottom).r - 0.008, bottom, 0),
  ]);
  return new TubeGeometry(curve, 48, 0.0145, 12, false);
}

function spoonGeometries() {
  // Bowl: thin lathe shell squashed into an oval
  const bowl = new LatheGeometry(
    [
      [0, 0],
      [0.5, 0.06],
      [0.85, 0.2],
      [1, 0.42],
      [0.97, 0.48],
      [0.92, 0.45],
      [0.78, 0.28],
      [0.45, 0.15],
      [0, 0.11],
    ].map(([r, y]) => new Vector2(r, y)),
    40,
  ).scale(0.058, 0.024, 0.038);

  const handle = new TubeGeometry(
    new CatmullRomCurve3([
      new Vector3(0.05, 0.01, 0),
      new Vector3(0.085, 0.022, 0),
      new Vector3(0.16, 0.03, 0),
      new Vector3(0.25, 0.027, 0),
    ]),
    24,
    0.0055,
    8,
    false,
  ).scale(1, 0.6, 1.25);

  const paddle = new SphereGeometry(1, 20, 10).scale(0.036, 0.0045, 0.0135).translate(0.262, 0.016, 0);
  return { bowl, handle, paddle };
}

function latteTexture(): Texture {
  const S = 512;
  const { canvas, ctx } = makeCanvas(S, S);
  const c = S / 2;
  const rand = rng(23);

  // Crema, darker toward the wall
  const base = ctx.createRadialGradient(c, c, 0, c, c, c);
  base.addColorStop(0, "#9a6239");
  base.addColorStop(0.6, "#7f4b27");
  base.addColorStop(0.86, "#5a3018");
  base.addColorStop(0.97, "#2f170a");
  base.addColorStop(1, "#1e0e06");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);

  // Foam mottling
  for (let i = 0; i < 2200; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const r = 0.6 + rand() * 2.4;
    ctx.fillStyle = rand() > 0.5 ? "rgba(190,130,80,0.08)" : "rgba(40,18,6,0.08)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Canvas top is the far side of the cup, so the lobes point away from the camera.
  const heart = (cx: number, cy: number, w: number, h: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + h * 0.5);
    ctx.bezierCurveTo(cx - w * 0.18, cy + h * 0.28, cx - w * 0.56, cy + h * 0.05, cx - w * 0.5, cy - h * 0.2);
    ctx.bezierCurveTo(cx - w * 0.44, cy - h * 0.5, cx - w * 0.08, cy - h * 0.52, cx, cy - h * 0.26);
    ctx.bezierCurveTo(cx + w * 0.08, cy - h * 0.52, cx + w * 0.44, cy - h * 0.5, cx + w * 0.5, cy - h * 0.2);
    ctx.bezierCurveTo(cx + w * 0.56, cy + h * 0.05, cx + w * 0.18, cy + h * 0.28, cx, cy + h * 0.5);
    ctx.closePath();
  };

  const milk = "#f4ece0";
  ctx.save();
  ctx.shadowColor = "rgba(244,236,224,0.9)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = milk;
  heart(c, c - 6, 300, 290);
  ctx.fill();
  ctx.restore();

  // Crema ripples across the lobes, fading toward the point.
  ctx.save();
  heart(c, c - 6, 300, 290);
  ctx.clip();
  ctx.lineCap = "round";
  for (let k = 0; k < 3; k++) {
    const w = 220 - k * 64;
    const h = 200 - k * 58;
    const top = c + 24 + k * 16 - h * 0.5;
    const fade = ctx.createLinearGradient(0, top, 0, top + h * 0.85);
    const a = 0.5 - k * 0.08;
    fade.addColorStop(0, `rgba(160,104,62,${a})`);
    fade.addColorStop(0.55, `rgba(160,104,62,${a * 0.7})`);
    fade.addColorStop(1, "rgba(160,104,62,0)");
    ctx.strokeStyle = fade;
    ctx.lineWidth = 7 - k * 1.5;
    ctx.shadowColor = "rgba(160,104,62,0.5)";
    ctx.shadowBlur = 8;
    heart(c, c + 24 + k * 16, w, h);
    ctx.stroke();
  }
  ctx.restore();

  // Tail that pulls the heart to a point
  ctx.save();
  ctx.strokeStyle = milk;
  ctx.lineCap = "round";
  ctx.shadowColor = milk;
  ctx.shadowBlur = 4;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(c, c + 120);
  ctx.quadraticCurveTo(c + 4, c + 170, c + 2, c + 205);
  ctx.stroke();
  ctx.restore();

  return canvasTexture(canvas, { color: true, anisotropy: 4 });
}

export function CoffeeCup({ position }: { position: readonly [number, number] }) {
  const [x, z] = position;

  const res = useMemo(() => {
    const latte = latteTexture();
    const porcelain = new MeshPhysicalMaterial({
      color: "#ebe6dd",
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.8,
    });
    const coffee = new MeshPhysicalMaterial({
      map: latte,
      roughness: 0.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    });
    const steel = new MeshStandardMaterial({ color: "#d9d6d0", metalness: 1, roughness: 0.2, envMapIntensity: 1.4 });
    return {
      latte,
      porcelain,
      coffee,
      steel,
      cup: cupGeometry(),
      saucer: saucerGeometry(),
      handle: handleGeometry(),
      coffeeDisc: new CircleGeometry(cupInner(COFFEE_Y) + 0.001, 64).rotateX(-Math.PI / 2),
      spoon: spoonGeometries(),
    };
  }, []);

  useEffect(
    () => () => {
      res.latte.dispose();
      res.porcelain.dispose();
      res.coffee.dispose();
      res.steel.dispose();
      res.cup.dispose();
      res.saucer.dispose();
      res.handle.dispose();
      res.coffeeDisc.dispose();
      res.spoon.bowl.dispose();
      res.spoon.handle.dispose();
      res.spoon.paddle.dispose();
    },
    [res],
  );

  return (
    <>
      <group position={[x, 0, z]}>
        <mesh geometry={res.saucer} material={res.porcelain} castShadow receiveShadow />

        {/* Handle points right and slightly toward the camera. */}
        <group position-y={SAUCER_TOP} rotation-y={-0.5}>
          <mesh geometry={res.cup} material={res.porcelain} castShadow receiveShadow />
          <mesh geometry={res.handle} material={res.porcelain} castShadow receiveShadow />
          <mesh geometry={res.coffeeDisc} material={res.coffee} position-y={COFFEE_Y} rotation-y={0.5} receiveShadow />
        </group>

        {/* Teaspoon */}
        <group position={[-0.085, 0.034, 0.236]} rotation={[0.03, 0.12, 0]}>
          <mesh geometry={res.spoon.bowl} material={res.steel} castShadow receiveShadow />
          <mesh geometry={res.spoon.handle} material={res.steel} castShadow receiveShadow />
          <mesh geometry={res.spoon.paddle} material={res.steel} castShadow receiveShadow />
        </group>
      </group>
      <Steam position={[x, SAUCER_TOP + COFFEE_Y + 0.01, z]} />
    </>
  );
}
