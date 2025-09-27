import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useState } from "react";

export default function App() {
  const [score, setScore] = useState(0);

  const handleClick = () => {
    setScore((prev) => prev + 1);
    alert("🎉 You found a character! Total: " + (score + 1));
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
      <model-viewer
        src={VodaModel}
        alt="Vodafone Character"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        interaction-prompt="none"
        style={{ width: "100%", height: "80%" }}
        onClick={handleClick}
      ></model-viewer>

      <div className="text-white text-lg mt-2">Score: {score}</div>
    </div>
  );
}
