"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

export function LogoModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/yellow-brand.glb");

  // Simple floating animation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation on Y axis
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      
      // Gentle floating up and down
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={2.5} />
    </group>
  );
}

// Preload the model
useGLTF.preload("/yellow-brand.glb");
