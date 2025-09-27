import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export default function App() {
  const modelRef = useRef<any>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const startAR = () => {
    if (modelRef.current) {
      modelRef.current.activateAR();
      moveCharacter();
    }
  };

  const moveCharacter = () => {
    if (!modelRef.current) return;

    const x = (Math.random() * 4 - 2).toFixed(2);
    const z = (Math.random() * -4 - 1).toFixed(2);

    modelRef.current.setAttribute("position", `${x} 0 ${z}`);

    if (!gameOver) {
      setTimeout(moveCharacter, 2000);
    }
  };

  const handleTap = (event: MouseEvent) => {
    if (!modelRef.current || gameOver) return;

    const viewer = modelRef.current;
    const scene = viewer?.model?.scene;
    const camera = viewer?.camera;

    if (!scene || !camera) return;

    // Convert click to normalized device coords
    const rect = viewer.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
      // 🎯 Hit the character!
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= 3) {
        setGameOver(true);
        alert("🎉 Congrats! You won a gift 🎁");
      }
    }
  };

  // Attach event listener for taps
  useEffect(() => {
    window.addEventListener("pointerdown", handleTap);
    return () => {
      window.removeEventListener("pointerdown", handleTap);
    };
  }, [score, gameOver]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-4">🎮 AR Treasure Hunt</h1>
      <p className="mb-4">Score: {score}</p>

      <button
        onClick={startAR}
        className="px-6 py-3 bg-green-500 rounded-lg mb-6"
      >
        Start AR
      </button>

      <model-viewer
        ref={modelRef}
        src={VodaModel}
        alt="Vodafone Character"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        autoplay
        style={{ width: "100%", height: "500px" }}
      ></model-viewer>
    </div>
  );
}
