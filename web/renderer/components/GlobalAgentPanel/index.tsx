import AgentChat from "@components/AgentChat";
import { useAgentContext } from "@contexts/agent";
import cx from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import css from "./index.module.css";

const MIN_WIDTH = 320;
const MAX_WIDTH = 800;

function Inner() {
  const { closePanel, panelWidth, setPanelWidth, hasSmallHeader } =
    useAgentContext();
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

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

export default function GlobalAgentPanel() {
  const { isPanelOpen, mcpConfig } = useAgentContext();
  const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

  if (!isElectron || !isPanelOpen || !mcpConfig) {
    return null;
  }

  return <Inner />;
}
