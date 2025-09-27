import { useRef, useEffect } from "react";

export default function App() {
  const modelRef = useRef(null);

  useEffect(() => {
    const modelViewer = modelRef.current;
    if (modelViewer) {
      // Add event listener for model clicks
      const handleModelClick = (event) => {
        // Check if the click was on the model itself
        const hit = modelViewer.positionAndNormalFromPoint(
          event.clientX,
          event.clientY
        );
        if (hit) {
          window.alert(
            `🎯 You clicked the model at position: ${hit.position.x.toFixed(
              2
            )}, ${hit.position.y.toFixed(2)}, ${hit.position.z.toFixed(2)}`
          );
        }
      };

      // Wait for model to load before adding event listeners
      const handleLoad = () => {
        modelViewer.addEventListener("click", handleModelClick);
      };

      // Listen for model load event
      modelViewer.addEventListener("load", handleLoad);

      // Cleanup
      return () => {
        modelViewer.removeEventListener("load", handleLoad);
        modelViewer.removeEventListener("click", handleModelClick);
      };
    }
  }, []);

  const startAR = () => {
    const modelViewer = modelRef.current;
    if (modelViewer) {
      // Wait for model to be ready, then try AR
      const attemptAR = async () => {
        try {
          // Ensure model is loaded
          if (!modelViewer.loaded) {
            await new Promise((resolve) => {
              modelViewer.addEventListener("load", resolve, { once: true });
            });
          }

          // Wait for any pending updates
          await modelViewer.updateComplete;

          // Check AR availability and activate
          if (
            typeof modelViewer.activateAR === "function" &&
            modelViewer.canActivateAR
          ) {
            await modelViewer.activateAR();
          } else {
            alert("AR is not available on this device/browser");
          }
        } catch (error) {
          console.error("AR activation failed:", error);
          alert(
            "Failed to start AR mode. Make sure you're on HTTPS and using a compatible device."
          );
        }
      };

      attemptAR();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-3xl mb-6">🎮 AR Treasure Hunt</h1>

      <p className="text-center mb-4 text-gray-300">
        Click on the 3D model below or start AR mode!
      </p>

      <button
        onClick={startAR}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg mb-6 transition-colors"
      >
        🚀 Start AR
      </button>

      {/* Visible and interactive model-viewer */}
      <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
        <model-viewer
          ref={modelRef}
          src="/assets/vodafoneCharacters.glb" // Note: You'll need to place your GLB file in the public folder
          alt="Vodafone Character"
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          loading="eager"
          style={{
            width: "400px",
            height: "400px",
            backgroundColor: "#1a1a1a",
          }}
          className="cursor-pointer"
        ></model-viewer>
      </div>

      <p className="text-sm text-gray-400 mt-4 text-center max-w-md">
        🖱️ Click and drag to rotate • 📱 Use AR button for immersive experience
      </p>
    </div>
  );
}
