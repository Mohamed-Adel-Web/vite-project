import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useRef, useState, useEffect } from "react";

export default function App() {
  const modelRef = useRef<any>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const startAR = () => {
    if (modelRef.current) {
      modelRef.current.activateAR();
      moveCharacter(); // start moving
    }
  };

  // Move character to random AR position
  const moveCharacter = () => {
    if (!modelRef.current) return;

    const x = (Math.random() * 4 - 2).toFixed(2); // -2 to 2
    const z = (Math.random() * -4 - 1).toFixed(2); // -1 to -5

    modelRef.current.setAttribute("position", `${x} 0 ${z}`);

    if (!gameOver) {
      setTimeout(moveCharacter, 2000);
    }
  };

  // Handle tap event
  const handleTap = () => {
    if (gameOver) return;

    const newScore = score + 1;
    setScore(newScore);

    if (newScore >= 3) {
      setGameOver(true);
      alert("🎉 Congrats! You won a gift 🎁");
    }
  };

  // Attach tap listener once model-viewer is mounted
  useEffect(() => {
    const node = modelRef.current;
    if (!node) return;

    const handleClick = () => handleTap();

    node.addEventListener("click", handleClick);

    return () => {
      node.removeEventListener("click", handleClick);
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

      {/* Hidden AR model */}
      <model-viewer
        ref={modelRef}
        src={VodaModel}
        alt="Vodafone Character"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        autoplay
        style={{ width: "0px", height: "0px", visibility: "hidden" }}
      ></model-viewer>
    </div>
  );
}
