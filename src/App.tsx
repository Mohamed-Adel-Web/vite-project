import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useState, useEffect } from "react";

export default function App() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    const viewers = document.querySelectorAll("model-viewer");
    viewers.forEach((viewer, i) => {
      viewer.addEventListener("click", (event: any) => {
        const hit = (viewer as any).positionAndNormalFromPoint(
          event.clientX,
          event.clientY
        );
        if (hit) {
          alert(`🎯 You caught Character ${i + 1}!`);
        }
      });
    });
  }, [started]);

  const positions = [
    { x: 0, y: 0, z: -1 },
    { x: 1, y: 0, z: -2 },
    { x: -1, y: 0, z: -2 },
    { x: 0.5, y: 0, z: -3 },
  ];

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-xl text-lg shadow-lg"
        >
          ▶ Start AR Game
        </button>
      ) : (
        positions.map((pos, i) => (
          <model-viewer
            key={i}
            src={VodaModel}
            alt={`Vodafone Character ${i + 1}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            camera-controls
            auto-rotate
            style={{ width: "100%", height: "100%", display: "none" }} // hidden but AR button shows
            data-position={`${pos.x} ${pos.y} ${pos.z}`}
          ></model-viewer>
        ))
      )}
    </div>
  );
}
