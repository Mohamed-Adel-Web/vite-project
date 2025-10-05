declare module "@zappar/zappar-react-three-fiber" {
  import { ReactNode } from "react";

  export const ZapparCanvas: React.FC<{ children?: ReactNode }>;
  export const ZapparCamera: React.FC<any>;
  export const InstantTracker: React.FC<{
    children?: ReactNode;
    placementMode?: string;
  }>;
  export const ImageTracker: React.FC<{
    children?: ReactNode;
    targetImage?: string;
  }>;
}
