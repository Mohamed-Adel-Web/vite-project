import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ZapparCanvas,
  ZapparCamera,
  InstantTracker,
} from "@zappar/zappar-react-three-fiber";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { Environment } from "@react-three/drei";

function Model() {
  const modelRef = useRef<THREE.Group>(null);
  const { gl, camera, scene } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(VodaModel, (gltf) => {
      modelRef.current?.add(gltf.scene);
    });
  }, []);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        alert("👋 Hi! You tapped the character!");
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [gl, camera, scene]);

  return <group ref={modelRef} scale={[0.5, 0.5, 0.5]} />;
}

export default function App() {
  const [start, setStart] = useState(false);

  if (!start) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl mb-6">🎮 AR Treasure Hunt</h1>
        <button
          onClick={() => setStart(true)}
          className="px-6 py-3 bg-green-500 rounded-lg"
        >
          Tap to Start AR
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vh",
        height: "100vh",
      }}
    >
      <ZapparCanvas>
        <ZapparCamera />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />
        <Environment preset="sunset" />

        <InstantTracker placementMode placement>
          <Model />
        </InstantTracker>
      </ZapparCanvas>
    </div>
  );
}
