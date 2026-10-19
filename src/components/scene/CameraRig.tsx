"use client";

import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef } from "react";
import { MathUtils, type PerspectiveCamera, Vector3 } from "three";
import { isBookOpen, usePortfolio } from "@/lib/store";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./book-config";

interface Framing {
  // world units that must fit on screen
  width: number;
  depth: number;
  // degrees above the desk, 90 = top-down
  elevation: number;
  focus: [number, number];
  // share of the viewport to use, leaves room for UI
  fill: number;
}

function framingFor(page: number, narrow: boolean, readSide: "left" | "right"): Framing {
  if (!isBookOpen(page)) {
    // Desk overview, book low in frame.
    return narrow
      ? { width: 2.6, depth: 2.6, elevation: 58, focus: [0, -0.35], fill: 1 }
      : { width: 5.4, depth: 2.9, elevation: 50, focus: [0, -0.3], fill: 1 };
  }
  if (narrow) {
    const x = readSide === "left" ? -PAGE_WIDTH / 2 : PAGE_WIDTH / 2;
    return { width: PAGE_WIDTH * 1.06, depth: PAGE_HEIGHT * 1.2, elevation: 80, focus: [x, 0.02], fill: 1 };
  }
  return { width: PAGE_WIDTH * 2.18, depth: PAGE_HEIGHT * 1.55, elevation: 66, focus: [0, 0.04], fill: 0.92 };
}

const desired = new Vector3();
const look = new Vector3();

export function CameraRig() {
  const lookAt = useRef(new Vector3(0, 0, -0.3));

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const { page, narrow, readSide, reducedMotion } = usePortfolio.getState();
    const f = framingFor(page, narrow, readSide);

    const aspect = state.size.width / Math.max(1, state.size.height);
    const vHalf = MathUtils.degToRad(camera.fov) / 2;
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    const elev = MathUtils.degToRad(f.elevation);
    // Desk depth is foreshortened by the viewing angle.
    const apparentDepth = f.depth * Math.sin(elev);
    const distance = Math.max(f.width / 2 / Math.tan(hHalf), apparentDepth / 2 / Math.tan(vHalf)) / f.fill;

    look.set(f.focus[0], 0, f.focus[1]);
    desired.set(look.x, distance * Math.sin(elev), look.z + distance * Math.cos(elev));

    // Pointer parallax, desktop only.
    if (!narrow && !reducedMotion) {
      const strength = isBookOpen(page) ? 0.12 : 0.35;
      desired.x += state.pointer.x * strength;
      desired.z -= state.pointer.y * strength * 0.5;
    }

    const dt = Math.min(delta, 0.05);
    if (reducedMotion) {
      camera.position.copy(desired);
      lookAt.current.copy(look);
    } else {
      easing.damp3(camera.position, desired, 0.65, dt);
      easing.damp3(lookAt.current, look, 0.65, dt);
    }
    camera.lookAt(lookAt.current);
  });

  return null;
}
