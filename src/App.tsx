import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ZapparCanvas,
  ZapparCamera,
  InstantTracker,
} from "@zappar/zappar-react-three-fiber";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment } from "@react-three/drei";
import VodaModel from "./assets/vodafoneCharacters.glb";

function Model() {
  const modelRef = useRef<THREE.Group>(null);
  const { gl, camera, scene } = useThree();

  // State for controls
  const [scale, setScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);

  // Touch control state
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 0.5,
    lastX: 0,
    rotating: false,
  });

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(VodaModel, (gltf) => {
      modelRef.current?.add(gltf.scene);

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
    });
  }, []);

  // Handle touch/mouse controls
  useEffect(() => {
    const canvas = gl.domElement;

    // Get distance between two touches
    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Touch start
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch gesture
        e.preventDefault();
        touchState.current.initialDistance = getDistance(
          e.touches[0],
          e.touches[1]
        );
        touchState.current.initialScale = scale;
      } else if (e.touches.length === 1) {
        // Rotation gesture
        touchState.current.rotating = true;
        touchState.current.lastX = e.touches[0].clientX;
      }
    };

    // Touch move
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch to scale
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleFactor =
          currentDistance / touchState.current.initialDistance;
        const newScale = Math.max(
          0.1,
          Math.min(2, touchState.current.initialScale * scaleFactor)
        );
        setScale(newScale);
      } else if (e.touches.length === 1 && touchState.current.rotating) {
        // Drag to rotate
        const deltaX = e.touches[0].clientX - touchState.current.lastX;
        setRotation((prev) => prev + deltaX * 0.01);
        touchState.current.lastX = e.touches[0].clientX;
      }
    };

    // Touch end
    const handleTouchEnd = () => {
      touchState.current.rotating = false;
    };

    // Mouse controls for desktop
    let mouseDown = false;
    let lastMouseX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      lastMouseX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDown) {
        const deltaX = e.clientX - lastMouseX;
        setRotation((prev) => prev + deltaX * 0.01);
        lastMouseX = e.clientX;
      }
    };

    const handleMouseUp = () => {
      mouseDown = false;
    };

    // Mouse wheel for zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      setScale((prev) => Math.max(0.1, Math.min(2, prev + delta)));
    };

    // Add event listeners
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [gl, scale]);

  // Double tap to reset
  useEffect(() => {
    let lastTap = 0;
    const handleDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
        setScale(0.5);
        setRotation(0);
      }
      lastTap = now;
    };

    gl.domElement.addEventListener("touchend", handleDoubleTap);
    return () => gl.domElement.removeEventListener("touchend", handleDoubleTap);
  }, [gl]);

  return (
    <group
      ref={modelRef}
      scale={[scale, scale, scale]}
      rotation={[0, rotation, 0]}
    />
  );
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
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      <ZapparCanvas>
        <ZapparCamera />

        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />

        <Environment preset="sunset" />

        <InstantTracker placementMode>
          <Model />
        </InstantTracker>
      </ZapparCanvas>

      {/* Control hints */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
        👆 Drag to rotate • 🤏 Pinch to zoom • ⚡ Double tap to reset
      </div>
    </div>
  );
}
