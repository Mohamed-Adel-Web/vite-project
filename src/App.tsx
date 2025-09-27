import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense } from "react";

function VodafoneCharacter(props: any) {
  const { scene } = useGLTF("/vodafoneCharacters.glb"); // model in public/
  return (
    <primitive
      object={scene}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        alert("🎉 You clicked the character!");
      }}
    />
  );
}

export default function App() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        <Suspense fallback={null}>
          <VodafoneCharacter scale={2} />

          {/* 🌍 Environment lighting (studio HDR) */}
          <Environment preset="sunset" background />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
