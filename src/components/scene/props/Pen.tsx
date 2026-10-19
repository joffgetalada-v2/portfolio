"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry, CapsuleGeometry, CylinderGeometry, LatheGeometry, MeshPhysicalMaterial, MeshStandardMaterial, SphereGeometry, Vector2 } from "three";

const R = 0.021;
const LENGTH = 0.75;

const v = (pts: [number, number][]) => pts.map(([r, y]) => new Vector2(r, y));

// Modelled along +Y with the tip at y = 0.
function penGeometries() {
  const tip = new LatheGeometry(
    v([
      [0, 0],
      [0.0018, 0.002],
      [0.004, 0.012],
      [0.0085, 0.04],
      [0.0118, 0.062],
      [0.0118, 0.066],
      [0, 0.066],
    ]),
    32,
  );

  const body: [number, number][] = [
    [0, 0.064],
    [0.0122, 0.064],
    [0.0145, 0.09],
    [0.0175, 0.13],
    [0.0195, 0.17],
    [0.0198, 0.205],
    [0, 0.205],
  ];
  const grip = new LatheGeometry(v(body), 40);

  const barrel = new LatheGeometry(
    v([
      [0, 0.221],
      [R, 0.221],
      [R, 0.69],
      [R * 0.97, 0.715],
      [R * 0.84, 0.735],
      [R * 0.55, 0.746],
      [0, LENGTH],
    ]),
    40,
  );

  const band = new CylinderGeometry(R + 0.0006, R + 0.0006, 0.016, 40).translate(0, 0.213, 0);
  // Rounded clip catches reflections better than a flat bar.
  const clip = new CapsuleGeometry(0.0032, 0.165, 6, 12).scale(1, 1, 0.75).translate(0, 0.6, R + 0.0052);
  const clipFoot = new SphereGeometry(0.0048, 16, 10).scale(1, 1.6, 1).translate(0, 0.515, R + 0.0045);
  const clipMount = new BoxGeometry(0.0075, 0.018, 0.009).translate(0, 0.684, R + 0.002);
  return { tip, grip, barrel, band, clip, clipFoot, clipMount };
}

/** `yaw` in radians; positive turns the tip away from the camera. */
export function Pen({ position, yaw = 0.5 }: { position: readonly [number, number]; yaw?: number }) {
  const [x, z] = position;

  const res = useMemo(() => {
    const black = new MeshPhysicalMaterial({
      color: "#0b0b0c",
      roughness: 0.48,
      clearcoat: 0.25,
      clearcoatRoughness: 0.4,
    });
    const brass = new MeshStandardMaterial({ color: "#d6b47e", metalness: 1, roughness: 0.3, envMapIntensity: 1.6 });
    const geo = penGeometries();
    return { black, brass, geo };
  }, []);

  useEffect(
    () => () => {
      res.black.dispose();
      res.brass.dispose();
      for (const g of Object.values(res.geo)) g.dispose();
    },
    [res],
  );

  const { geo } = res;
  return (
    // Lay the +Y axis on the desk, clip up.
    <group position={[x, R, z]} rotation-y={yaw}>
      <group rotation={[-Math.PI / 2, 0, Math.PI / 2]} position-x={LENGTH / 2}>
        <mesh geometry={geo.tip} material={res.brass} castShadow receiveShadow />
        <mesh geometry={geo.grip} material={res.black} castShadow receiveShadow />
        <mesh geometry={geo.band} material={res.brass} castShadow receiveShadow />
        <mesh geometry={geo.barrel} material={res.black} castShadow receiveShadow />
        <mesh geometry={geo.clip} material={res.brass} castShadow receiveShadow />
        <mesh geometry={geo.clipFoot} material={res.brass} castShadow />
        <mesh geometry={geo.clipMount} material={res.brass} castShadow />
      </group>
    </group>
  );
}
