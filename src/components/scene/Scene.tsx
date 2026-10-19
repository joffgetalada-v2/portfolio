"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { usePortfolio } from "@/lib/store";
import { Book } from "./Book";
import { CameraRig } from "./CameraRig";
import { Desk } from "./Desk";
import { Lights } from "./Lights";
import { Props } from "./Props";

const CONTEXT_LOSS_GRACE_MS = 5000;

// Needed for frameloop "demand".
function StoreInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => usePortfolio.subscribe(() => invalidate()), [invalidate]);
  return null;
}

// Hidden until Book has compiled shaders and uploaded textures.
function Reveal({ children }: { children: ReactNode }) {
  const sceneReady = usePortfolio((s) => s.sceneReady);
  return <group visible={sceneReady}>{children}</group>;
}

export function Scene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [canvasKey, setCanvasKey] = useState(0);
  const idle = usePortfolio((s) => s.reducedMotion || s.activeWork !== null || s.contactOpen);

  // Pause rendering while offscreen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        key={canvasKey}
        shadows="percentage"
        dpr={[1, 2]}
        // Nothing animates on its own with reduced motion or behind a dialog.
        frameloop={!visible ? "never" : idle ? "demand" : "always"}
        camera={{ fov: 32, near: 0.1, far: 60, position: [0, 6, 5] }}
        gl={{ antialias: true, powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}
        onCreated={({ gl }) => {
          // Context loss is usually temporary (GPU reset, backgrounded mobile tab).
          // Remount on restore; fall back if it doesn't come back.
          let timer: number | undefined;
          gl.domElement.addEventListener("webglcontextlost", () => {
            timer = window.setTimeout(() => usePortfolio.getState().setWebglFailed(true), CONTEXT_LOSS_GRACE_MS);
          });
          gl.domElement.addEventListener("webglcontextrestored", () => {
            window.clearTimeout(timer);
            setCanvasKey((k) => k + 1);
          });
        }}
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 8, 16]} />
        <StoreInvalidator />
        <Suspense fallback={null}>
          <Lights />
          <Reveal>
            <Desk />
            <Props />
            <Book />
          </Reveal>
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
