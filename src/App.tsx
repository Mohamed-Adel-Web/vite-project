import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Add click listener for all characters
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
  }, []);

  // Random positions (x, z) around user
  const positions = [
    { x: 0, y: 0, z: -1 }, // in front
    { x: 1, y: 0, z: -2 }, // right
    { x: -1, y: 0, z: -2 }, // left
    { x: 0.5, y: 0, z: -3 }, // farther away
  ];

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <h1 className="absolute top-4 text-2xl">
        🎮 AR Hunt: Catch 4 Characters!
      </h1>

      {positions.map((pos, i) => (
        <model-viewer
          key={i}
          src={VodaModel}
          alt={`Vodafone Character ${i + 1}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-placement="floor"
          camera-controls
          auto-rotate
          style={{ width: "100%", height: "100%" }}
          data-position={`${pos.x} ${pos.y} ${pos.z}`}
        ></model-viewer>
      ))}
    </div>
  );
}
