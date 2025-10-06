import React, { useEffect, useRef } from "react";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <a-scene
          vr-mode-ui="enabled: false;"
          embedded
          arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false;"
        >
       
            <a-entity
              gltf-model="./vodafoneCharacters.glb"
              position="0 0 0"
              scale="50 50 50"
            ></a-entity>
          </a-nft>
          <a-entity camera></a-entity>
        </a-scene>
      `;
    }
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
