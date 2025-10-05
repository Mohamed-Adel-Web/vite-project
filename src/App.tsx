import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Replace this with your actual model path
import VodaModel from "./assets/vodafoneCharacters.glb";

export default function App() {
  const [start, setStart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const arToolkitSourceRef = useRef<any>(null);
  const arToolkitContextRef = useRef<any>(null);

  // State for controls
  const [scale, setScale] = useState(0.5);
  const [targetScale, setTargetScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);

  // Touch control state
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 0.5,
    lastX: 0,
    rotating: false,
    moved: false,
    isPinching: false,
  });

  useEffect(() => {
    if (!start || !containerRef.current) return;

    // Load AR.js scripts dynamically
    const loadARScripts = async () => {
      // Load AR.js
      const arScript = document.createElement("script");
      arScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/ar.js/2.2.2/ar.min.js";
      arScript.async = true;

      await new Promise((resolve) => {
        arScript.onload = resolve;
        document.head.appendChild(arScript);
      });

      initAR();
    };

    const initAR = () => {
      const container = containerRef.current;
      if (!container) return;

      // Setup scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Setup camera
      const camera = new THREE.Camera();
      scene.add(camera);
      cameraRef.current = camera;

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor(new THREE.Color("lightgrey"), 0);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0px";
      renderer.domElement.style.left = "0px";
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Setup AR.js
      const arToolkitSource = new (window as any).THREEx.ArToolkitSource({
        sourceType: "webcam",
      });

      arToolkitSource.init(() => {
        onResize();
      });
      arToolkitSourceRef.current = arToolkitSource;

      // Handle resize
      window.addEventListener("resize", onResize);

      // Setup AR context
      const arToolkitContext = new (window as any).THREEx.ArToolkitContext({
        cameraParametersUrl:
          "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/data/data/camera_para.dat",
        detectionMode: "mono",
      });

      arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
      });
      arToolkitContextRef.current = arToolkitContext;

      // Setup marker (markerless AR)
      const markerRoot = new THREE.Group();
      scene.add(markerRoot);

      const markerControls = new (window as any).THREEx.ArMarkerControls(
        arToolkitContext,
        markerRoot,
        {
          type: "pattern",
          patternUrl:
            "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/data/data/patt.hiro",
        }
      );

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-5, 5, -5);
      scene.add(directionalLight2);

      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(0, 5, 0);
      scene.add(pointLight);

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        VodaModel,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(0.5, 0.5, 0.5);
          model.position.set(0, 0, 0);

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.needsUpdate = true;
              }
            }
          });

          markerRoot.add(model);
          modelRef.current = model;
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
        }
      );

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        if (arToolkitSource.ready) {
          arToolkitContext.update(arToolkitSource.domElement);
        }

        // Update model transforms
        if (modelRef.current) {
          modelRef.current.scale.set(scale, scale, scale);
          modelRef.current.rotation.y = rotation;

          // Smooth scale animation
          if (
            !touchState.current.isPinching &&
            Math.abs(scale - targetScale) > 0.01
          ) {
            setScale((prev) => prev + (targetScale - prev) * 0.1);
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      // Touch/Mouse controls
      setupControls(renderer.domElement, camera, scene);
    };

    const onResize = () => {
      if (
        arToolkitSourceRef.current &&
        rendererRef.current &&
        cameraRef.current &&
        arToolkitContextRef.current
      ) {
        arToolkitSourceRef.current.onResizeElement();
        arToolkitSourceRef.current.copyElementSizeTo(
          rendererRef.current.domElement
        );
        if (arToolkitContextRef.current.arController !== null) {
          arToolkitSourceRef.current.copyElementSizeTo(
            arToolkitContextRef.current.arController.canvas
          );
        }
      }
    };

    const setupControls = (
      canvas: HTMLCanvasElement,
      camera: THREE.Camera,
      scene: THREE.Scene
    ) => {
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
          e.preventDefault();
          touchState.current.isPinching = true;
          touchState.current.initialDistance = getDistance(
            e.touches[0],
            e.touches[1]
          );
          touchState.current.initialScale = scale;
        } else if (e.touches.length === 1) {
          touchState.current.rotating = true;
          touchState.current.lastX = e.touches[0].clientX;
        }
      };

      // Touch move
      const handleTouchMove = (e: TouchEvent) => {
        touchState.current.moved = true;

        if (e.touches.length === 2) {
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
          const deltaX = e.touches[0].clientX - touchState.current.lastX;
          setRotation((prev) => prev + deltaX * 0.01);
          touchState.current.lastX = e.touches[0].clientX;
        }
      };

      // Touch end
      const handleTouchEnd = (e: TouchEvent) => {
        if (touchState.current.isPinching) {
          touchState.current.isPinching = false;
          setTargetScale(0.5);
        }

        if (!touchState.current.moved && e.changedTouches.length === 1) {
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

      // Mouse controls
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

      // Mouse wheel
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.max(0.1, Math.min(2, scale + delta));
        setScale(newScale);

        setTimeout(() => {
          setTargetScale(0.5);
        }, 500);
      };

      // Double tap to reset
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

      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd);
      canvas.addEventListener("touchend", handleDoubleTap);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    };

    loadARScripts();

    return () => {
      // Cleanup
      if (arToolkitSourceRef.current && arToolkitSourceRef.current.domElement) {
        const videoElement = arToolkitSourceRef.current.domElement;
        if (videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach((track: MediaStreamTrack) => track.stop());
        }
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [start, scale, rotation, targetScale]);

  if (!start) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl mb-6">🎮 AR Treasure Hunt</h1>
        <p className="text-sm mb-4 text-center text-gray-400 max-w-md px-4">
          👆 Drag to rotate • 🤏 Pinch to zoom (auto-resets) • 👆 Tap to say hi
        </p>
        <p className="text-xs mb-6 text-center text-gray-500 max-w-md px-4">
          📱 Point your camera at a Hiro marker or any flat surface
        </p>
        <button
          onClick={() => setStart(true)}
          className="px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          Tap to Start AR
        </button>
        <a
          href="https://github.com/AR-js-org/AR.js/blob/master/data/images/hiro.png"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-xs text-blue-400 underline"
        >
          Download Hiro Marker (print or display on screen)
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Control hints */}
      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm"
        style={{ zIndex: 999 }}
      >
        👆 Drag to rotate • 🤏 Pinch to zoom • 👆 Tap to say hi • ✌️ Double tap
        to reset
      </div>

      <div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 bg-opacity-70 text-white px-4 py-2 rounded-lg text-xs"
        style={{ zIndex: 999 }}
      >
        📷 Point camera at Hiro marker
      </div>
    </div>
  );
}
