declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": {
      src: string;
      alt?: string;
      "auto-rotate"?: boolean;
      "camera-controls"?: boolean;
      ar?: boolean;
      "ar-modes"?: string;
      style?: React.CSSProperties;
    };
  }
}
