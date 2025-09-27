import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useEffect, useRef } from "react";

export default function App() {
  const modelRef = useRef<any>(null);

  const startAR = () => {
    if (modelRef.current) {
      modelRef.current.activateAR(); // 🚀 directly opens AR mode
    }
  };

  useEffect(() => {
    if (!modelRef.current) return;

    const modelViewer = modelRef.current;

    // 👆 Handle taps inside the 3D canvas
    const handleTap = (event: MouseEvent) => {
      const hit = modelViewer.positionAndNormalFromPoint(
        event.clientX,
        event.clientY
      );
      if (hit) {
        alert("🎉 You tapped on the character!");
      }
    };

    modelViewer.addEventListener("click", handleTap);
    return () => modelViewer.removeEventListener("click", handleTap);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-6">🎮 AR Treasure Hunt</h1>

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
        style={{ width: "100%", height: "500px" }}
      ></model-viewer>
    </div>
  );
}
