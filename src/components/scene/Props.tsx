"use client";

import { useEffect, useMemo } from "react";
import { usePortfolio } from "@/lib/store";
import { DESK_LAYOUT, DESK_LAYOUT_NARROW, type DeskLayout } from "./book-config";
import { Cards } from "./props/Cards";
import { CoffeeCup } from "./props/CoffeeCup";
import { Pen } from "./props/Pen";
import { Plant } from "./props/Plant";
import { contactShadowTexture } from "./props/procedural";

type Contact = [x: number, z: number, width: number, depth: number, yaw: number, opacity: number];

// Blob shadows to ground props where the spotlight shadow is too sharp or offset.
function contactShadows(layout: DeskLayout): Contact[] {
  const out: Contact[] = [
    [layout.cup[0], layout.cup[1], 0.86, 0.86, 0, 0.62],
    [layout.plant[0], layout.plant[1], 0.56, 0.56, 0, 0.72],
    [layout.pen[0], layout.pen[1], 0.86, 0.085, layout.penYaw, 0.6],
  ];
  if (layout.cards) out.push([layout.cards[0], layout.cards[1], 0.62, 0.4, -0.16, 0.42]);
  return out;
}

export function Props() {
  const narrow = usePortfolio((s) => s.narrow);
  const layout = narrow ? DESK_LAYOUT_NARROW : DESK_LAYOUT;
  const contact = useMemo(() => contactShadows(layout), [layout]);
  const blob = useMemo(() => contactShadowTexture(), []);
  useEffect(() => () => blob.dispose(), [blob]);

  return (
    <group>
      {contact.map(([x, z, w, d, yaw, opacity], i) => (
        <mesh key={i} position={[x, 0.0015, z]} rotation={[-Math.PI / 2, 0, yaw]} renderOrder={1} raycast={() => null}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial
            map={blob}
            color="#000000"
            transparent
            opacity={opacity}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            toneMapped={false}
          />
        </mesh>
      ))}
      <CoffeeCup position={layout.cup} />
      <Plant position={layout.plant} />
      <Pen position={layout.pen} yaw={layout.penYaw} />
      {layout.cards && <Cards position={layout.cards} />}
    </group>
  );
}
