"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { SceneFallback } from "./scene-fallback";

const MODEL_PATH = "/models/ai-core.glb";
const emptySubscribe = () => () => undefined;

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
      <SceneFallback message="3D preview unavailable" />
    ) : (
      this.props.children
    );
  }
}

function AICore({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;

    const targetX = state.pointer.y * 0.08;
    const targetY = state.pointer.x * 0.12 + state.clock.elapsedTime * 0.08;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      targetX,
      3,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetY,
      3,
      delta,
    );
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.035;
  });

  return (
    <group ref={group} rotation={[0.08, -0.3, 0]}>
      <Center>
        <primitive object={scene} scale={1.65} />
      </Center>
    </group>
  );
}

function CoreScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      aria-label="Interactive 3D model of the NEXUS AI Core"
      camera={{ position: [0, 0, 4.5], fov: 38 }}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#c9fbff" />
      <pointLight position={[-3, -1, 2]} intensity={10} color="#7357ff" />
      <Suspense fallback={null}>
        <AICore reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}

export function AICoreCanvas() {
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
    return <SceneFallback message="AI Core preview" />;
  }

  return (
    <SceneErrorBoundary>
      <CoreScene reducedMotion={reducedMotion} />
    </SceneErrorBoundary>
  );
}
