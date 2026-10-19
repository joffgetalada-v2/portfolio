"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, PlaneGeometry, type Group, type ShaderMaterial } from "three";
import { usePortfolio } from "@/lib/store";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.3 + uSeed * 7.0;
    // Two levels of sideways drift: a slow lean plus faster curls, both growing with height.
    float sway = (fbm(vec2(uv.y * 1.5 - t * 0.5, uSeed * 3.1)) - 0.5) * 0.8 * uv.y;
    float curl = (fbm(vec2(uv.y * 4.0 - t * 1.2, uSeed * 5.3 + 2.0)) - 0.5) * 0.22 * uv.y;
    float x = uv.x - 0.5 - sway - curl;
    float width = mix(0.045, 0.22, uv.y);
    float column = exp(-(x * x) / (width * width));
    // Ridged noise gives thin filaments; a slower field breaks them into rising puffs.
    float n = fbm(vec2(x * 8.0 + uSeed * 4.0, uv.y * 2.4 - t * 1.0));
    float strands = pow(1.0 - abs(n * 2.0 - 1.0), 3.0);
    float puffs = smoothstep(0.3, 0.75, fbm(vec2(uv.x * 2.0 + uSeed * 9.0, uv.y * 2.2 - t * 0.8)));
    float fadeIn = smoothstep(0.0, 0.2, uv.y);
    float fadeOut = 1.0 - smoothstep(0.35, 1.0, uv.y);
    float a = column * strands * mix(0.35, 1.0, puffs) * fadeIn * fadeOut * uOpacity * 1.7;
    gl_FragColor = vec4(uColor, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const WISPS = [
  { x: -0.035, z: 0.0, seed: 0.13, scale: 1, opacity: 0.16 },
  { x: 0.03, z: -0.02, seed: 0.57, scale: 0.85, opacity: 0.13 },
  { x: 0.005, z: 0.03, seed: 0.91, scale: 1.15, opacity: 0.1 },
];

const STEAM_W = 0.34;
const STEAM_H = 0.8;
// Non-zero so the reduced-motion still frame isn't the t = 0 pattern.
const START_TIME = 2.5;

/** World-space position; the wisps billboard around Y. */
export function Steam({ position }: { position: [number, number, number] }) {
  const group = useRef<Group>(null);
  const mats = useRef<(ShaderMaterial | null)[]>([]);
  const time = useRef(START_TIME);

  const geometry = useMemo(() => new PlaneGeometry(STEAM_W, STEAM_H, 1, 1).translate(0, STEAM_H / 2, 0), []);
  const uniforms = useMemo(() => {
    const color = new Color("#fff3e2");
    return WISPS.map((w) => ({
      uTime: { value: START_TIME },
      uSeed: { value: w.seed },
      uOpacity: { value: w.opacity },
      uColor: { value: color },
    }));
  }, []);

  useFrame(({ camera }, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = Math.atan2(camera.position.x - position[0], camera.position.z - position[2]);
    if (usePortfolio.getState().reducedMotion) return;
    time.current += Math.min(delta, 0.1);
    for (const m of mats.current) if (m) m.uniforms.uTime.value = time.current;
  });

  return (
    <group ref={group} position={position}>
      {WISPS.map((w, i) => (
        <mesh key={i} geometry={geometry} position={[w.x, 0, w.z]} scale={[w.scale, w.scale, 1]} renderOrder={2} raycast={() => null}>
          <shaderMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}
