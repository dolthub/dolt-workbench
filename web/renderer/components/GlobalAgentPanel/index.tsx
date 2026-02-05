import AgentChat from "@components/AgentChat";
import { useAgentContext } from "@contexts/agent";
import cx from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import css from "./index.module.css";

const MIN_WIDTH = 320;
const MAX_WIDTH = 800;

export default function GlobalAgentPanel() {
  const {
    isPanelOpen,
    closePanel,
    mcpConfig,
    panelWidth,
    setPanelWidth,
    hasSmallHeader,
  } = useAgentContext();
  const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate new width based on mouse position from right edge
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth));
      setPanelWidth(clampedWidth);
    },
    [isResizing, setPanelWidth],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Don't render if not in Electron, panel is closed, or no database connection
  if (!isElectron || !isPanelOpen || !mcpConfig) {
    return null;
  }

  return (
    <div
      className={cx(css.panel, { [css.smallHeader]: hasSmallHeader })}
      style={{ width: panelWidth }}
      ref={panelRef}
    >
      <div
        className={css.resizeHandle}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
      />
      <AgentChat onClose={closePanel} />
    </div>
  );
}
