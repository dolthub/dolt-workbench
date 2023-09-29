import { ReactNode } from "react";
import ReactLoader from "react-loader";

interface LoaderOptions {
  lines?: number;
  length?: number;
  width?: number;
  radius?: number;
  scale?: number;
  corners?: number;
  color?: string;
  opacity?: number;
  rotate?: number;
  direction?: number;
  speed?: number;
  trail?: number;
  fps?: number;
  zIndex?: number;
  top?: string;
  left?: string;
  shadow?: boolean;
  hwaccel?: boolean;
  position?: string;
  loadedClassName?: string;
}

interface LoaderProps extends LoaderOptions {
  loaded: boolean;
  options?: LoaderOptions;
  className?: string;
  children?: ReactNode;
}

// Fixed loader in center of viewport
export default function Loader(props: LoaderProps) {
  return <ReactLoader {...props} position="fixed" />;
}
