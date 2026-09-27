"use client";

import { Center, Environment, Lightformer, Sparkles, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Component, Suspense, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { SceneFallback } from "./scene-fallback";

const MODEL_PATH = "/models/ai-core.glb";
const emptySubscribe = () => () => undefined;

export type CoreFocus = "context" | "tools" | "checks" | null;

/** Mutable interaction state shared between DOM handlers and the render loop. */
export type CoreInteraction = {
  hover: boolean;
  dragging: boolean;
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  invalidate?: () => void;
};

export function createInteraction(): CoreInteraction {
  return { hover: false, dragging: false, rotX: 0, rotY: 0, velX: 0, velY: 0 };
}

const RING_BY_FOCUS: Record<Exclude<CoreFocus, null>, string> = {
  context: "Ring_Cyan",
  tools: "Ring_Violet",
  checks: "Ring_Graphite",
};

const RING_SPEED: Record<string, number> = {
  Ring_Cyan: 0.34,
  Ring_Violet: -0.24,
  Ring_Graphite: 0.18,
};

const FOCUS_GLOW = new THREE.Color("#55e8ff");

function supportsWebGL() {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // The static fallback below keeps a failed model from breaking the page.
  }

  render() {
    return this.state.failed ? (
      <SceneFallback message="3D-превью недоступно" />
    ) : (
      this.props.children
    );
  }
}

type GlowMaterial = {
  material: THREE.MeshPhysicalMaterial;
  baseIntensity: number;
  baseEmissive: THREE.Color;
  phase: number;
};

type Ring = {
  object: THREE.Object3D;
  name: string;
  glows: GlowMaterial[];
};

function setGlow(glow: GlowMaterial, intensity: number) {
  glow.material.emissiveIntensity = intensity;
}

function upgradeMaterial(source: THREE.Material): THREE.MeshPhysicalMaterial {
  const original = source as THREE.MeshStandardMaterial;
  const isGraphite = original.name.includes("Graphite");

  return new THREE.MeshPhysicalMaterial({
    name: original.name,
    color: original.color.clone(),
    emissive: original.emissive.clone(),
    emissiveIntensity: original.emissiveIntensity,
    metalness: isGraphite ? 0.92 : 0.35,
    roughness: isGraphite ? 0.2 : 0.14,
    clearcoat: isGraphite ? 1 : 0.35,
    clearcoatRoughness: isGraphite ? 0.06 : 0.1,
    envMapIntensity: isGraphite ? 1.35 : 0.45,
    side: THREE.FrontSide,
  });
}

function prepareModel(scene: THREE.Group) {
  const root = scene.clone(true);
  const glowsByRoot = new Map<THREE.Object3D, GlowMaterial[]>();
  let phase = 0;

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    const material = upgradeMaterial(object.material as THREE.Material);
    object.material = material;

    let owner: THREE.Object3D = object;
    while (owner.parent && owner.parent !== root) owner = owner.parent;

    const list = glowsByRoot.get(owner) ?? [];
    list.push({
      material,
      baseIntensity: material.emissiveIntensity * (material.name.includes("Cyan") ? 0.26 : 0.45),
      baseEmissive: material.emissive.clone(),
      phase: (phase += 1.7),
    });
    glowsByRoot.set(owner, list);
  });

  const shell = root.getObjectByName("Core_Shell") ?? null;
  const rings: Ring[] = Object.keys(RING_SPEED).flatMap((name) => {
    const object = root.getObjectByName(name);
    return object
      ? [{ object, name, glows: glowsByRoot.get(object) ?? [] }]
      : [];
  });

  return {
    root,
    shell,
    shellGlows: shell ? glowsByRoot.get(shell) ?? [] : [],
    rings,
  };
}

function Shockwave({
  pulse,
  reducedMotion,
  color,
  delay,
}: {
  pulse: number;
  reducedMotion: boolean;
  color: string;
  delay: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const startedAt = useRef(-Infinity);
  const clock = useThree((state) => state.clock);

  useEffect(() => {
    if (pulse > 0) startedAt.current = clock.elapsedTime + delay;
  }, [pulse, clock, delay]);

  useFrame((state) => {
    if (!mesh.current || !material.current) return;
    const progress = (state.clock.elapsedTime - startedAt.current) / 1.25;
    const active = !reducedMotion && progress >= 0 && progress <= 1;
    mesh.current.visible = active;
    if (!active) return;

    const eased = 1 - Math.pow(1 - progress, 3);
    mesh.current.scale.setScalar(0.62 + eased * 1.9);
    material.current.opacity = (1 - progress) * 0.55;
  });

  return (
    <mesh ref={mesh} visible={false}>
      <ringGeometry args={[0.985, 1, 160]} />
      <meshBasicMaterial
        ref={material}
        color={color}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function AICore({
  reducedMotion,
  focus,
  pulse,
  interactionRef,
}: {
  reducedMotion: boolean;
  focus: CoreFocus;
  pulse: number;
  interactionRef: RefObject<CoreInteraction>;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const model = useMemo(() => prepareModel(scene), [scene]);
  const modelRef = useRef<ReturnType<typeof prepareModel> | null>(null);
  const focusGlowRef = useRef<Record<string, number>>({});
  const energy = useRef(0);
  const pulseAt = useRef(-Infinity);
  const clock = useThree((state) => state.clock);
  const invalidate = useThree((state) => state.invalidate);
  // Keep the rings inside narrow (mobile) frames: the orbit radius is ~1.05 units at scale 1.
  const fitScale = useThree((state) => Math.min(1.22, state.viewport.width / 2 / 1.08));

  useEffect(() => {
    const current = interactionRef.current;
    current.invalidate = invalidate;
    return () => {
      current.invalidate = undefined;
    };
  }, [interactionRef, invalidate]);

  useEffect(() => {
    if (pulse > 0) pulseAt.current = clock.elapsedTime;
    invalidate();
  }, [pulse, clock, invalidate]);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    invalidate();
  }, [focus, invalidate]);

  useFrame((state, delta) => {
    const root = group.current;
    if (!root) return;
    const input = interactionRef.current;
    const rig = modelRef.current;
    if (!rig) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 20);
    const focusedRing = focus ? RING_BY_FOCUS[focus] : null;
    const sincePulse = t - pulseAt.current;
    const surge = reducedMotion ? 0 : Math.pow(Math.max(0, 1 - sincePulse / 1.6), 2);

    // Drag inertia: velocity decays smoothly once the pointer is released.
    if (!input.dragging && !reducedMotion) {
      input.rotY += input.velY;
      input.rotX += input.velX;
      input.velY = THREE.MathUtils.damp(input.velY, 0, 2.6, dt);
      input.velX = THREE.MathUtils.damp(input.velX, 0, 2.6, dt);
    }
    input.rotX = THREE.MathUtils.clamp(input.rotX, -0.7, 0.7);
    if (!input.dragging) {
      input.rotX = THREE.MathUtils.damp(input.rotX, 0, reducedMotion ? 99 : 0.9, dt);
    }

    const engaged = (input.hover ? 1 : 0) + (focusedRing ? 0.45 : 0);
    energy.current = reducedMotion
      ? engaged
      : THREE.MathUtils.damp(energy.current, engaged, 3.2, dt);
    const e = energy.current;

    const parallaxX = input.hover && !reducedMotion ? state.pointer.y * 0.12 : 0;
    const parallaxY = input.hover && !reducedMotion ? state.pointer.x * 0.18 : 0;
    const drift = reducedMotion ? 0 : t * 0.07;
    const targetX = 0.08 + input.rotX + parallaxX;
    const targetY = -0.3 + input.rotY + parallaxY + drift;

    if (reducedMotion) {
      root.rotation.set(targetX, targetY, 0);
    } else {
      root.rotation.x = THREE.MathUtils.damp(root.rotation.x, targetX, 4, dt);
      root.rotation.y = THREE.MathUtils.damp(root.rotation.y, targetY, 4, dt);
      root.position.y = Math.sin(t * 0.7) * 0.04;
      if (rig.shell) rig.shell.rotation.y += dt * (0.12 + e * 0.25 + surge * 1.4);
    }

    for (const ring of rig.rings) {
      const isFocused = ring.name === focusedRing;
      const isDimmed = focusedRing !== null && !isFocused;
      const focusGlow = reducedMotion
        ? Number(isFocused)
        : THREE.MathUtils.damp(focusGlowRef.current[ring.name] ?? 0, Number(isFocused), 5, dt);
      focusGlowRef.current[ring.name] = focusGlow;

      if (!reducedMotion) {
        const speed = RING_SPEED[ring.name] ?? 0.2;
        ring.object.rotateZ(dt * speed * (1 + e * 1.6 + surge * 7 + focusGlow * 1.2));
      }

      const scale = 1 + e * 0.025 + surge * 0.07 + focusGlow * 0.045;
      ring.object.scale.setScalar(scale);

      for (const glow of ring.glows) {
        const breathe = reducedMotion ? 1 : 0.88 + Math.sin(t * 1.4 + glow.phase) * 0.12;
        const dim = isDimmed ? 0.3 : 1;
        glow.material.emissive.copy(glow.baseEmissive).lerp(FOCUS_GLOW, glow.baseEmissive.getHex() === 0 ? focusGlow : 0);
        setGlow(
          glow,
          Math.max(glow.baseIntensity * (1 + focusGlow * 0.5), focusGlow * 0.9) *
            breathe *
            (1 + e * 0.35 + surge * 1.6) *
            dim,
        );
      }
    }

    for (const glow of rig.shellGlows) {
      const breathe = reducedMotion ? 1 : 0.8 + Math.sin(t * 1.9 + glow.phase) * 0.2;
      setGlow(glow, glow.baseIntensity * breathe * (1 + e * 0.5 + surge * 2.2));
    }

    if (!reducedMotion && (surge > 0 || Math.abs(input.velY) > 1e-4)) state.invalidate();
  });

  return (
    <group ref={group} rotation={[0.08, -0.3, 0]}>
      <Center>
        <primitive object={model.root} scale={fitScale} />
      </Center>
    </group>
  );
}

function StudioLighting() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3.2} color="#d8fbff" position={[0, 4, 3]} scale={[8, 1.6, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#55e8ff" position={[-5, 0.5, 1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#8b7bff" position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
      <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 0, -6]} scale={3} />
    </Environment>
  );
}

function CoreScene({
  reducedMotion,
  visible,
  focus,
  pulse,
  interactionRef,
}: {
  reducedMotion: boolean;
  visible: boolean;
  focus: CoreFocus;
  pulse: number;
  interactionRef: RefObject<CoreInteraction>;
}) {
  const frameloop = reducedMotion ? "demand" : visible ? "always" : "never";

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 4.5], fov: 38 }}
      dpr={[1, 2]}
      flat
      frameloop={frameloop}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
    >
      <color attach="background" args={["#06080c"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#c9fbff" />
      <pointLight position={[-3, -1, 2]} intensity={9} color="#7357ff" />
      <StudioLighting />
      <Suspense fallback={null}>
        <AICore
          reducedMotion={reducedMotion}
          focus={focus}
          pulse={pulse}
          interactionRef={interactionRef}
        />
      </Suspense>
      <Shockwave pulse={pulse} reducedMotion={reducedMotion} color="#55e8ff" delay={0} />
      <Shockwave pulse={pulse} reducedMotion={reducedMotion} color="#8b7bff" delay={0.18} />
      <Sparkles
        count={46}
        scale={[3.6, 3, 2.2]}
        size={1.6}
        speed={reducedMotion ? 0 : 0.28}
        opacity={0.55}
        color="#9ff4ff"
        noise={0.6}
      />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.8} luminanceSmoothing={0.25} intensity={0.85} radius={0.72} />
        <Vignette offset={0.32} darkness={0.55} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}

export function AICoreCanvas({
  visible,
  focus,
  pulse,
  interactionRef,
}: {
  visible: boolean;
  focus: CoreFocus;
  pulse: number;
  interactionRef: RefObject<CoreInteraction>;
}) {
  const webGLAvailable = useSyncExternalStore(
    emptySubscribe,
    supportsWebGL,
    () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => true,
  );

  if (!webGLAvailable) {
    return <SceneFallback message="Превью ядра" />;
  }

  return (
    <SceneErrorBoundary>
      <CoreScene
        reducedMotion={reducedMotion}
        visible={visible}
        focus={focus}
        pulse={pulse}
        interactionRef={interactionRef}
      />
    </SceneErrorBoundary>
  );
}
