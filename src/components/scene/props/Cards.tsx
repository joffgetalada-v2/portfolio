"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, use, useEffect, useMemo, useRef } from "react";
import { BoxGeometry, MeshStandardMaterial, type Group } from "three";
import { profile } from "@/content/profile";
import { usePortfolio } from "@/lib/store";
import { loadFaceFonts } from "../textures/fonts";
import type { FaceFonts } from "../textures/types";
import { canvasTexture, makeCanvas, rng } from "./procedural";

const CARD_W = 0.5;
const CARD_D = 0.29;
const CARD_T = 0.0035;
const STACK = [
  { x: 0.012, z: 0.006, r: 0.07 },
  { x: -0.01, z: -0.004, r: -0.045 },
  { x: 0.004, z: 0.01, r: 0.025 },
];
const TOP_Y = STACK.length * (CARD_T + 0.0004) + CARD_T / 2;

const INK = "#151513";
const PAPER = "#e6e1d7";
const GOLD = "#a9844a";

// Brand mark: circle with the left half filled, same as the header.
function drawGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Printed face of the top card. Exported for the /dev/faces preview. */
export function drawCard(fonts: FaceFonts): HTMLCanvasElement {
  const W = 1200;
  const H = Math.round((W * CARD_D) / CARD_W);
  const { canvas, ctx } = makeCanvas(W, H);
  const rand = rng(91);

  // Cotton stock with faint fibre grain
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.09)" : "rgba(80,70,55,0.05)";
    ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 3, 1);
  }

  const m = 72;
  ctx.textBaseline = "alphabetic";
  const track = (text: string, x: number, y: number, spacing: number, align: "left" | "right" = "left") => {
    let cx = x;
    if (align === "right") {
      for (const ch of text) cx -= ctx.measureText(ch).width + spacing;
      cx += spacing;
    }
    for (const ch of text) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + spacing;
    }
  };

  // Mark and location
  drawGlyph(ctx, m + 16, m + 8, 16, GOLD);
  ctx.font = `400 22px ${fonts.mono}`;
  ctx.fillStyle = "rgba(21,21,19,0.55)";
  track(profile.location.toUpperCase(), W - m, m + 16, 2.5, "right");

  // Name on two lines: sans given names, italic serif surname
  const words = profile.name.split(" ");
  const last = words.pop() ?? "";
  const first = words.join(" ");
  ctx.fillStyle = INK;
  ctx.font = `600 84px ${fonts.sans}`;
  ctx.letterSpacing = "-2px";
  ctx.fillText(first, m - 4, 252);
  ctx.letterSpacing = "0px";
  ctx.font = `italic 400 112px ${fonts.serif}`;
  ctx.fillText(last, m - 6, 362);

  // Headline: role, then platforms
  const [role, platforms] = profile.headline.split(" · ");
  ctx.font = `500 22px ${fonts.mono}`;
  ctx.fillStyle = "rgba(21,21,19,0.72)";
  track(role.toUpperCase(), m, 440, 2.5);
  if (platforms) track(platforms.toUpperCase(), m, 476, 2.5);

  // Footer: rule and email
  ctx.fillStyle = "rgba(21,21,19,0.18)";
  ctx.fillRect(m, H - m - 52, W - m * 2, 2);
  ctx.fillStyle = INK;
  ctx.font = `400 28px ${fonts.mono}`;
  ctx.fillText(profile.email, m, H - m);

  return canvas;
}

function CardStack({ position }: { position: readonly [number, number] }) {
  const [x, z] = position;
  const fonts = use(loadFaceFonts());
  const top = useRef<Group>(null);
  const hovered = useRef(false);
  const invalidate = useThree((s) => s.invalidate);

  const res = useMemo(() => {
    const face = canvasTexture(drawCard(fonts), { color: true, anisotropy: 8 });
    const paper = new MeshStandardMaterial({ color: PAPER, roughness: 0.82 });
    const edge = new MeshStandardMaterial({ color: "#d9d3c7", roughness: 0.9 });
    const printed = new MeshStandardMaterial({ map: face, roughness: 0.78 });
    const card = new BoxGeometry(CARD_W, CARD_T, CARD_D);
    const hit = new BoxGeometry(CARD_W + 0.06, 0.08, CARD_D + 0.06);
    // BoxGeometry groups: +x, -x, +y, -y, +z, -z
    const topMaterials = [edge, edge, printed, paper, edge, edge];
    const plainMaterials = [edge, edge, paper, paper, edge, edge];
    return { face, paper, edge, printed, card, hit, topMaterials, plainMaterials };
  }, [fonts]);

  useEffect(
    () => () => {
      res.face.dispose();
      res.paper.dispose();
      res.edge.dispose();
      res.printed.dispose();
      res.card.dispose();
      res.hit.dispose();
    },
    [res],
  );

  // Reset the cursor if unmounted mid-hover.
  useEffect(
    () => () => {
      if (hovered.current) document.body.style.cursor = "";
    },
    [],
  );

  useFrame((state, delta) => {
    const g = top.current;
    if (!g) return;
    const on = hovered.current;
    // With frameloop "demand" the first delta after idling covers the whole gap.
    const dt = usePortfolio.getState().reducedMotion ? 1 : Math.min(delta, 0.05);
    const moving = [
      easing.damp(g.position, "y", TOP_Y + (on ? 0.03 : 0), 0.18, dt),
      easing.damp(g.rotation, "x", on ? 0.16 : 0, 0.2, dt),
      easing.damp(g.rotation, "z", on ? -0.035 : 0, 0.22, dt),
    ].some(Boolean);
    if (moving) state.invalidate();
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    document.body.style.cursor = "pointer";
    invalidate();
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = false;
    document.body.style.cursor = "";
    invalidate();
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    usePortfolio.getState().setContactOpen(true);
  };

  return (
    <group position={[x, 0, z]} rotation-y={-0.16}>
      {STACK.map((c, i) => (
        <mesh
          key={i}
          geometry={res.card}
          material={res.plainMaterials}
          position={[c.x, CARD_T / 2 + i * (CARD_T + 0.0004), c.z]}
          rotation-y={c.r}
          castShadow
          receiveShadow
        />
      ))}
      {/* Pivot on the front edge so the card tilts up toward the camera. */}
      <group ref={top} position={[0, TOP_Y, CARD_D / 2]}>
        <mesh geometry={res.card} material={res.topMaterials} position-z={-CARD_D / 2} castShadow receiveShadow />
      </group>
      <mesh
        geometry={res.hit}
        position-y={0.04}
        visible={false}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      />
    </group>
  );
}

/** Opens the contact panel on click. Suspends until the web fonts load. */
export function Cards({ position }: { position: readonly [number, number] }) {
  return (
    <Suspense fallback={null}>
      <CardStack position={position} />
    </Suspense>
  );
}
