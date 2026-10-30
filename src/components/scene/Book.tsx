"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  MathUtils,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { isBookOpen, usePortfolio } from "@/lib/store";
import {
  FACE_H,
  LAST_PAGE,
  PAGE_DEPTH,
  PAGE_HEIGHT,
  PAGE_SEGMENTS,
  PAGE_WIDTH,
  SHEETS,
  SPREADS,
  type FaceId,
} from "./book-config";
import { faces } from "./textures/faces";
import { CONTENTS_ROWS } from "./textures/layout";
import { usePageTextures, type FaceTextures } from "./usePageTextures";

const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
const SHEET_COUNT = SHEETS.length;

// Page motion
const TURN_SMOOTH = 0.42; // damping time, roughly seconds
const GUTTER_CURL = 0.1; // radians a resting page lifts at the spine
const CURL_BONES = 5; // bones the gutter curl spreads over
const TURN_BEND = 0.035; // bend per bone mid-turn
const STEP_MS = 140; // delay between sheets when jumping spreads
const STEP_FAST_MS = 55;
const IN_FLIGHT = 0.6; // radians from rest; past this a sheet is mid-turn and ignores clicks
const AUTO_ANIMATE_S = 8; // no hover on touch, so the open page animates for this long
const SETTLED_SQ = 1e-7; // camera movement per frame, squared, that counts as at rest
const SETTLE_MAX_MS = 2000; // reveal anyway after this, e.g. while the pointer keeps moving

function createPageGeometry() {
  const geometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
  geometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = geometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const index = MathUtils.clamp(Math.floor(vertex.x / SEGMENT_WIDTH), 0, PAGE_SEGMENTS - 1);
    const weight = MathUtils.clamp((vertex.x - index * SEGMENT_WIDTH) / SEGMENT_WIDTH, 0, 1);
    skinIndexes.push(index, index + 1, 0, 0);
    skinWeights.push(1 - weight, weight, 0, 0);
  }
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
  return geometry;
}

const PAPER_EDGE = new Color("#e9e4d8");
const COVER_EDGE = new Color("#121212");
const HOVER_GLOW = new Color("#ffffff");

// Contents row (0-based) at canvas y, or -1.
function contentsRowAt(y: number) {
  const { top, rowH, ascent } = CONTENTS_ROWS;
  const row = Math.floor((y - (top - ascent)) / rowH);
  return row >= 0 && row < SPREADS.length ? row : -1;
}

interface PageProps {
  index: number;
  geometry: BoxGeometry;
  hitGeometry: PlaneGeometry;
  hitMaterial: MeshBasicMaterial;
  textures: FaceTextures;
  shownPage: RefObject<number>;
}

function Page({ index, geometry, hitGeometry, hitMaterial, textures, shownPage }: PageProps) {
  const group = useRef<Group>(null);
  const skinnedRef = useRef<SkinnedMesh>(null);
  const hitRef = useRef<Mesh>(null);
  const angle = useRef(0); // 0 = right stack, PI = left stack
  const glow = useRef(0);
  const { front, back } = SHEETS[index];
  const isCoverSheet = index === 0 || index === SHEET_COUNT - 1;

  const mesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
      bones.push(bone);
    }
    const edge = new MeshStandardMaterial({ color: isCoverSheet ? COVER_EDGE : PAPER_EDGE, roughness: 0.9 });
    const face = (id: FaceId) =>
      new MeshStandardMaterial({
        map: textures[id],
        emissiveMap: textures[id],
        emissive: HOVER_GLOW,
        emissiveIntensity: 0,
        roughness: id === "cover" || id === "back-cover" ? 0.42 : 0.62,
        metalness: 0,
      });
    // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
    const skinned = new SkinnedMesh(geometry, [edge, edge, edge, edge, face(front), face(back)]);
    skinned.castShadow = true;
    skinned.receiveShadow = true;
    skinned.frustumCulled = false;
    // Raycast a flat proxy instead; CPU-skinning every page per pointer move is too slow.
    skinned.raycast = () => {};
    skinned.add(bones[0]);
    skinned.bind(new Skeleton(bones));
    return skinned;
  }, [geometry, textures, front, back, isCoverSheet]);

  useEffect(
    () => () => {
      for (const material of mesh.material as MeshStandardMaterial[]) material.dispose();
      mesh.skeleton.dispose();
    },
    [mesh],
  );

  useFrame((state, delta) => {
    const g = group.current;
    const skinned = skinnedRef.current;
    if (!g || !skinned) return;
    const store = usePortfolio.getState();
    const page = shownPage.current;
    const turned = page > index;
    const target = turned ? Math.PI : 0;
    const dt = Math.min(delta, 0.05);

    if (store.reducedMotion) angle.current = target;
    else easing.damp(angle, "current", target, TURN_SMOOTH, dt);
    const phi = angle.current;
    const progress = phi / Math.PI;
    const direction = Math.sign(target - phi);

    // Both stacks rest on the desk: cover at the bottom of the left, last sheet at the bottom of the right.
    const rightHeight = (SHEET_COUNT - 1 - index) * PAGE_DEPTH + PAGE_DEPTH / 2;
    const leftHeight = index * PAGE_DEPTH + PAGE_DEPTH / 2;
    g.position.z = MathUtils.lerp(rightHeight, leftHeight, progress) + 0.0015;

    const closed = page === 0 || page === LAST_PAGE;
    const curl = closed ? 0 : GUTTER_CURL * Math.cos(phi);
    // Positive rotation about the spine tips a page down, so "up" is negative.
    g.rotation.y = -phi - curl;
    // Keep the hit plane flat, ignoring the gutter curl.
    if (hitRef.current) hitRef.current.rotation.y = curl;

    const bones = skinned.skeleton.bones;
    const bend = TURN_BEND * Math.sin(phi) * direction;
    for (let i = 1; i < bones.length; i++) {
      const settle = i <= CURL_BONES ? curl / CURL_BONES : 0;
      const flight = bend * Math.sin((i / PAGE_SEGMENTS) * Math.PI);
      bones[i].rotation.y = settle + flight;
    }

    // A sheet flipping under a still pointer moves hover to the face now showing.
    const faceShown = turned ? back : front;
    const faceHidden = turned ? front : back;
    if (store.hoveredFace === faceHidden) store.setHoveredFace(faceShown);

    const glowTarget = store.hoveredFace === faceShown ? 0.07 : 0;
    glow.current = MathUtils.damp(glow.current, glowTarget, 8, dt);
    const materials = skinned.material as MeshStandardMaterial[];
    materials[4].emissiveIntensity = materials[5].emissiveIntensity = glow.current;

    // frameloop "demand": keep invalidating until the sheet settles.
    if (Math.abs(phi - target) > 1e-3 || Math.abs(glow.current - glowTarget) > 1e-3) state.invalidate();
  });

  const faceUnder = () => (shownPage.current > index ? back : front);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    usePortfolio.getState().setHoveredFace(faceUnder());
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const state = usePortfolio.getState();
    if (state.hoveredFace === front || state.hoveredFace === back) state.setHoveredFace(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 8) return; // drag or swipe
    if (e.nativeEvent.detail > 1) return; // double-click
    const turned = shownPage.current > index;
    if (Math.abs(angle.current - (turned ? Math.PI : 0)) > IN_FLIGHT) return;

    const state = usePortfolio.getState();
    const { page, narrow, readSide } = state;
    if (page === 0) return state.openBook();
    if (page === LAST_PAGE) return state.goTo(LAST_PAGE - 1, "right");

    // Phones show one page; tapping the edge of the facing page goes to it.
    if (narrow && turned && readSide === "right") return state.prev();
    if (narrow && !turned && readSide === "left") return state.next();

    const face = turned ? back : front;
    if (face === "contents" && e.uv) {
      const row = contentsRowAt((1 - e.uv.y) * FACE_H);
      if (row >= 0) return state.goTo(SPREADS[row].page, "left");
    }
    if (face === "contact") return state.setContactOpen(true);

    if (narrow) return state.next();
    // Desktop: left page turns back, right page turns forward.
    state.goTo(turned ? index : index + 1);
  };

  return (
    <group ref={group} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      <primitive ref={skinnedRef} object={mesh} />
      <mesh ref={hitRef} geometry={hitGeometry} material={hitMaterial} visible={false} />
    </group>
  );
}

export function Book() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const { textures, redraw, ensureDrawn } = usePageTextures(gl.capabilities.getMaxAnisotropy(), invalidate);
  const geometry = useMemo(() => createPageGeometry(), []);
  const hitGeometry = useMemo(() => new PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT).translate(PAGE_WIDTH / 2, 0, 0), []);
  // DoubleSide so left-stack pages (back face up) still get hits.
  const hitMaterial = useMemo(() => new MeshBasicMaterial({ side: DoubleSide }), []);
  const root = useRef<Group>(null);
  const shownPage = useRef(0);
  // Own clock: R3F resets its clock when frameloop changes.
  const time = useRef(0);
  const lastStep = useRef(0);
  const anim = useRef<{ face: FaceId | null; start: number; last: number }>({ face: null, start: 0, last: 0 });

  useEffect(
    () => () => {
      geometry.dispose();
      hitGeometry.dispose();
      hitMaterial.dispose();
    },
    [geometry, hitGeometry, hitMaterial],
  );

  useEffect(() => {
    if (!textures) return;
    let cancelled = false;
    let raf = 0;
    // The canvas fades in over the static poster, so wait for the camera to come to rest first.
    const last = camera.position.clone();
    let still = 0;
    let settleStart = 0;
    const reveal = (now: number) => {
      if (cancelled) return;
      settleStart ||= now;
      still = camera.position.distanceToSquared(last) < SETTLED_SQ ? still + 1 : 0;
      last.copy(camera.position);
      if (still >= 3 || now - settleStart > SETTLE_MAX_MS) usePortfolio.getState().setSceneReady(true);
      else raf = requestAnimationFrame(reveal);
    };
    // Compile shaders async and upload one texture per frame while the poster shows, so early turns don't stall.
    const compiled = Promise.race([
      gl.compileAsync(scene, camera).catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);
    compiled.then(() => {
      const queue = Object.values(textures);
      const step = () => {
        if (cancelled) return;
        const texture = queue.shift();
        if (texture) {
          gl.initTexture(texture);
          raf = requestAnimationFrame(step);
        } else {
          raf = requestAnimationFrame(() => (raf = requestAnimationFrame(reveal)));
        }
      };
      step();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [textures, gl, scene, camera]);

  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );

  useFrame((state, delta) => {
    const store = usePortfolio.getState();
    time.current += Math.min(delta, 0.1);
    const now = time.current;

    // Jumping several spreads turns one sheet at a time.
    if (store.reducedMotion) shownPage.current = store.page;
    else if (shownPage.current !== store.page) {
      const gap = Math.abs(store.page - shownPage.current);
      if ((now - lastStep.current) * 1000 >= (gap > 2 ? STEP_FAST_MS : STEP_MS)) {
        const next = shownPage.current + Math.sign(store.page - shownPage.current);
        // Draw queued pages before they turn into view.
        if (next === LAST_PAGE) ensureDrawn("back-cover");
        else if (next > 0) {
          ensureDrawn(SPREADS[next - 1].left);
          ensureDrawn(SPREADS[next - 1].right);
        }
        shownPage.current = next;
        lastStep.current = now;
      }
      state.invalidate();
    }

    // Centre the closed book, or the spine when open.
    const page = shownPage.current;
    const r = root.current;
    if (r) {
      const x = page === 0 ? -PAGE_WIDTH / 2 : page === LAST_PAGE ? PAGE_WIDTH / 2 : 0;
      const tilt = page === 0 ? 0.07 : page === LAST_PAGE ? -0.05 : 0;
      const dt = Math.min(delta, 0.05);
      if (store.reducedMotion) {
        r.position.x = x;
        r.rotation.y = tilt;
      } else {
        easing.damp(r.position, "x", x, 0.45, dt);
        easing.dampAngle(r.rotation, "y", tilt, 0.45, dt);
      }
    }

    // Animate the hovered face, or on touch the open page for AUTO_ANIMATE_S.
    let face = store.hoveredFace;
    let auto = false;
    if (!face && store.narrow && isBookOpen(store.page)) {
      const spread = SPREADS[store.page - 1];
      face = store.readSide === "left" ? spread.left : spread.right;
      auto = true;
    }
    if (store.reducedMotion || (face && !faces[face].animated)) face = null;
    const a = anim.current;
    if (face !== a.face) {
      if (a.face) redraw(a.face, 0);
      a.face = face;
      a.start = now;
      a.last = -1;
    }
    if (face && auto && now - a.start > AUTO_ANIMATE_S) {
      if (a.last >= 0) redraw(face, 0);
      a.last = -1;
      return;
    }
    if (face && now - a.last >= 1 / 30) {
      redraw(face, now - a.start);
      a.last = now;
    }
  });

  if (!textures) return null;

  return (
    <group ref={root} position-x={-PAGE_WIDTH / 2} rotation-y={0.07}>
      {/* Lay flat: page +Z (front) up, top edge away from the camera. */}
      <group rotation-x={-Math.PI / 2}>
        {SHEETS.map((_, index) => (
          <Page
            key={index}
            index={index}
            geometry={geometry}
            hitGeometry={hitGeometry}
            hitMaterial={hitMaterial}
            textures={textures}
            shownPage={shownPage}
          />
        ))}
      </group>
    </group>
  );
}
