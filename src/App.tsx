// App.tsx
import { useState, useEffect } from "react";
import "@google/model-viewer";
import "./App.css";
import VodaModel from "./assets/vodafoneCharacters.glb";

function App() {
  const TOTAL_TARGETS = 4;
  const GAME_TIME = 30; // seconds

  const [found, setFound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameOver, setGameOver] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handle finding a character
  const handleFind = () => {
    if (gameOver) return;
    setFound((prev) => {
      const newFound = prev + 1;
      if (newFound >= TOTAL_TARGETS) {
        setGameOver(true);
      }
      return newFound;
    });
  };

  return (
    <div className="game-container">
      <h2>
        Time Left: {timeLeft}s | Found: {found}/{TOTAL_TARGETS}
      </h2>

      {!gameOver ? (
        <div className="models">
          {Array.from({ length: TOTAL_TARGETS }).map((_, i) => (
            <model-viewer
              key={i}
              src={VodaModel}
              alt={`Vodafone Character ${i + 1}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              interaction-prompt="none"
              style={{ width: "200px", height: "200px", margin: "10px" }}
              onClick={handleFind}
            />
          ))}
        </div>
      ) : (
        <h1>
          {found >= TOTAL_TARGETS ? "🎉 You Win!" : "⏰ Time’s Up! You Lose!"}
        </h1>
      )}
    </div>
  );
}

export default App;
