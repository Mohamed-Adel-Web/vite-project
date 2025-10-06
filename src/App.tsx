import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment } from "@react-three/drei";
import vodaModel from "./assets/vodafoneCharacters.glb";

function Model() {
  const modelRef = useRef<THREE.Group>(null);
  const { gl, camera, scene } = useThree();
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const initialCameraRotation = useRef<THREE.Euler | null>(null);
  const modelWorldPosition = useRef<THREE.Vector3 | null>(null);

  // State for controls
  const [scale, setScale] = useState(0.5);
  const [targetScale, setTargetScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Touch control state
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 0.5,
    lastX: 0,
    rotating: false,
    moved: false,
    isPinching: false,
  });

  // Smooth scale animation and camera tracking
  useFrame(() => {
    if (
      !touchState.current.isPinching &&
      Math.abs(scale - targetScale) > 0.01
    ) {
      setScale((prev) => prev + (targetScale - prev) * 0.1);
    }

    // Capture initial camera position when gyroscope first activates
    if (
      !initialized &&
      (gyroRef.current.beta !== 0 || gyroRef.current.gamma !== 0)
    ) {
      initialCameraRotation.current = camera.rotation.clone();

      // Place model 5 units in front of camera at current orientation
      const direction = new THREE.Vector3(0, 0, -5);
      direction.applyQuaternion(camera.quaternion);
      modelWorldPosition.current = camera.position.clone().add(direction);
      modelWorldPosition.current.y -= 1; // Lower it a bit

      setInitialized(true);
    }

    // Update camera rotation based on device orientation
    if (gyroRef.current.beta !== 0 || gyroRef.current.gamma !== 0) {
      const beta = (gyroRef.current.beta * Math.PI) / 180;
      const gamma = (gyroRef.current.gamma * Math.PI) / 180;
      const alpha = (gyroRef.current.alpha * Math.PI) / 180;

      camera.rotation.order = "YXZ";
      camera.rotation.y = alpha;
      camera.rotation.x = beta - Math.PI / 2;
      camera.rotation.z = -gamma;
    }
  });

  useEffect(() => {
    const loader = new GLTFLoader();

    // Try to load the Vodafone model - if it fails, create a cube placeholder

    loader.load(
      vodaModel,
      (gltf) => {
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
      },
      undefined,
      (error) => {
        console.log("Could not load GLB model, using placeholder cube");
        // Create a simple cube as placeholder
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
          color: 0xe60000,
          metalness: 0.5,
          roughness: 0.5,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        modelRef.current?.add(cube);
      }
    );

    // Device orientation for gyroscope
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        gyroRef.current = {
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma,
        };
      }
    };

    // Request permission for iOS 13+
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
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
      touchState.current.moved = false;

      if (e.touches.length === 2) {
        // Pinch gesture
        e.preventDefault();
        touchState.current.isPinching = true;
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
      touchState.current.moved = true;

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

    // Touch end - check for tap and reset scale
    const handleTouchEnd = (e: TouchEvent) => {
      // Reset scale when pinch ends
      if (touchState.current.isPinching) {
        touchState.current.isPinching = false;
        setTargetScale(0.5); // Return to original size
      }

      if (!touchState.current.moved && e.changedTouches.length === 1) {
        // This was a tap, not a drag
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          window.alert("Hi! 👋");
        }
      }

      touchState.current.rotating = false;
    };

    // Mouse controls for desktop
    let mouseDown = false;
    let lastMouseX = 0;
    let mouseMoved = false;

    const handleMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      lastMouseX = e.clientX;
      mouseMoved = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDown) {
        mouseMoved = true;
        const deltaX = e.clientX - lastMouseX;
        setRotation((prev) => prev + deltaX * 0.01);
        lastMouseX = e.clientX;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseMoved) {
        // This was a click, not a drag
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          window.alert("Hi! 👋");
        }
      }
      mouseDown = false;
    };

    // Mouse wheel for zoom (temporary, returns to original)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newScale = Math.max(0.1, Math.min(2, scale + delta));
      setScale(newScale);

      // Return to original size after wheel zoom
      setTimeout(() => {
        setTargetScale(0.5);
      }, 500);
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
  }, [gl, scale, camera, scene]);

  // Double tap to reset rotation
  useEffect(() => {
    let lastTap = 0;
    const handleDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
        setScale(0.5);
        setTargetScale(0.5);
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
      position={
        modelWorldPosition.current
          ? [
              modelWorldPosition.current.x,
              modelWorldPosition.current.y,
              modelWorldPosition.current.z,
            ]
          : [0, -1, -5]
      }
    />
  );
}

export default function App() {
  const [start, setStart] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (start && videoRef.current) {
      // Request camera access for AR background
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setCameraReady(true);
          }
        })
        .catch((err) => {
          console.error("Camera access denied:", err);
          alert(
            "Camera access is required for AR. Please allow camera permissions."
          );
        });

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((track) => track.stop());
        }
      };
    }
  }, [start]);

  if (!start) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", marginBottom: "1.5rem" }}>
          🎮 AR Treasure Hunt
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            marginBottom: "1rem",
            color: "#9ca3af",
          }}
        >
          👆 Drag to rotate • 🤏 Pinch to zoom (auto-resets) • 👆 Tap to say hi
        </p>
        <button
          onClick={() => setStart(true)}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#10b981",
            borderRadius: "0.5rem",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#059669")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#10b981")
          }
        >
          Tap to Start AR
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Camera video background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Three.js Canvas overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight args={[0xffffff, 0.5]} position={[-5, 5, -5]} />
          <pointLight position={[0, 5, 0]} intensity={0.5} />

          <Environment preset="sunset" />

          <Model />
        </Canvas>
      </div>

      {/* Control hints */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          zIndex: 2,
        }}
      >
        {cameraReady ? (
          <>
            👆 Drag to rotate • 🤏 Pinch to zoom • 👆 Tap to say hi • ✌️ Double
            tap to reset
          </>
        ) : (
          <>📷 Initializing camera...</>
        )}
      </div>
    </div>
  );
}
