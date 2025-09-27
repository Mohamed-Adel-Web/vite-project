import "@google/model-viewer";
import VodaModel from "./assets/vodafoneCharacters.glb";
import { useRef } from "react";

export default function App() {
  const modelRef = useRef<any>(null);

  const startAR = () => {
    if (modelRef.current) {
      modelRef.current.activateAR(); // 🚀 directly opens AR mode
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-6">🎮 AR Treasure Hunt</h1>

      <button
        onClick={startAR}
        className="px-6 py-3 bg-green-500 rounded-lg mb-6"
      >
        Start AR
      </button>

      {/* Hidden model-viewer (only used to trigger AR) */}
      <model-viewer
        ref={modelRef}
        onClick={() => {
          window.alert("hi");
        }}
        src={VodaModel}
        alt="Vodafone Character"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        style={{ width: "0px", height: "0px", visibility: "hidden" }}
      ></model-viewer>
    </div>
  );
}
