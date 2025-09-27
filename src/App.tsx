import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
// @ts-ignore
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { useEffect } from "react";
import VodaModel from "./assets/vodafoneCharacters.glb";

function Character({ onCatch }: { onCatch: () => void }) {
  const { scene } = useGLTF(VodaModel);

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, -2]}
      onClick={onCatch} // 👈 works directly
    />
  );
}

export default function App() {
  useEffect(() => {
    // Add AR button to DOM
    document.body.appendChild(
      ARButton.createButton((window as any).renderer, {
        requiredFeatures: ["hit-test"],
      })
    );
  }, []);

  const handleCatch = () => {
    alert("🎉 You tapped the character!");
  };

  return (
    <Canvas
      camera={{ position: [0, 1.6, 3], fov: 70 }}
      onCreated={({ gl }) => {
        (window as any).renderer = gl;
        gl.xr.enabled = true;
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 2]} />
      <Character onCatch={handleCatch} />
      <OrbitControls />
    </Canvas>
  );
}
