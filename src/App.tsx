import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { XR, ARButton, createXRStore } from "@react-three/xr";

import { ModelViewer } from "./components/ModelViewer";
import vodaChar from "./assets/vodafoneCharacters.glb";

export default function App() {
  const store = createXRStore();

  return (
    <div className="w-full h-screen bg-black">
      <ARButton store={store} />

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            <ModelViewer path={vodaChar} />
            {/* 🌍 Environment lighting (studio HDR) */}
            <Environment preset="sunset" />
          </Suspense>

          <OrbitControls />
        </XR>
      </Canvas>
    </div>
  );
}
