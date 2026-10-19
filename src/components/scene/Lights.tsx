"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { SpotLight } from "three";

// One warm lamp; everything outside the cone falls to black.
export function Lights() {
  const spot = useRef<SpotLight>(null);

  useEffect(() => {
    const light = spot.current;
    if (!light) return;
    light.target.position.set(0, 0, 0.1);
    light.target.updateMatrixWorld();
  }, []);

  return (
    <>
      <ambientLight intensity={0.05} />
      <hemisphereLight args={["#fff4e5", "#0a0806", 0.12]} />
      <spotLight
        ref={spot}
        position={[0.6, 6.5, 1.6]}
        angle={0.44}
        penumbra={0.85}
        intensity={3.2}
        decay={0}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={2}
        shadow-camera-far={12}
      />
      {/* Reflections for the glazed and metal props, no HDR download. */}
      <Environment resolution={128} environmentIntensity={0.35}>
        <Lightformer intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} color="#fff1dc" />
        <Lightformer intensity={0.4} position={[-5, 2, 2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
      </Environment>
    </>
  );
}
