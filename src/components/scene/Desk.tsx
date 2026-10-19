"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { createWoodMaps, TILE_H, TILE_W } from "./props/woodTexture";

const DESK_SIZE = 24;

// Only the spotlight pool really shows; the rest fades into fog.
export function Desk() {
  const gl = useThree((s) => s.gl);

  const { wood, small } = useMemo(() => {
    // Screen size, not viewport, so a narrow desktop window still gets full detail.
    const small = Math.min(screen.width, screen.height) < 768 || gl.capabilities.maxTextureSize < 4096;
    const wood = createWoodMaps({
      width: small ? 1024 : 2048,
      anisotropy: Math.min(8, gl.capabilities.getMaxAnisotropy()),
      repeat: [DESK_SIZE / TILE_W, DESK_SIZE / TILE_H],
    });
    return { wood, small };
  }, [gl]);

  useEffect(() => () => wood.dispose(), [wood]);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[DESK_SIZE, DESK_SIZE]} />
      <meshStandardMaterial
        map={wood.map}
        roughnessMap={wood.surface}
        roughness={1}
        // Bump on the magnified 1024 map looks blocky on phones.
        bumpMap={small ? null : wood.surface}
        bumpScale={0.05}
        metalness={0}
        envMapIntensity={0.12}
      />
    </mesh>
  );
}
