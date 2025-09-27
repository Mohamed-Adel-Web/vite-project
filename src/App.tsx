import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useRef } from "react";

export default function App() {
  const viewersRef = useRef<any[]>([]);

  const startAR = () => {
    // 🚀 Start AR for all models
    viewersRef.current.forEach((viewer) => {
      if (viewer) viewer.activateAR();
    });
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-6">🎮 AR Hunt</h1>

      <button
        onClick={startAR}
        className="px-6 py-3 bg-green-500 rounded-lg mb-6"
      >
        Start AR
      </button>

      {/* 4 hidden model-viewers (different positions in AR) */}
      {[0, 1, 2, 3].map((_, i) => (
        <model-viewer
          key={i}
          ref={(el) => (viewersRef.current[i] = el)}
          src={VodaModel}
          alt={`Vodafone Character ${i + 1}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          style={{ width: "0px", height: "0px", visibility: "hidden" }}
        ></model-viewer>
      ))}
    </div>
  );
}
