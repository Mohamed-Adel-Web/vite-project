// src/components/ModelViewer.tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";

interface ModelProps {
  path: string;
}

export const ModelViewer = ({ path }: ModelProps) => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(path);

  // Optional animation or rotation
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return <primitive ref={group} object={scene} />;
};
