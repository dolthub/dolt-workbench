import { useCallback, useEffect, useState } from "react";

const DEFAULT_PANEL_WIDTH = 420;

export type PanelState = {
  isPanelOpen: boolean;
  panelWidth: number;
  setPanelWidth: (width: number) => void;
  hasSmallHeader: boolean;
  setHasSmallHeader: (value: boolean) => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

export function usePanelState(): PanelState {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [hasSmallHeader, setHasSmallHeader] = useState(false);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);

  // Listen for toggle-agent-panel custom event (from menu or keyboard shortcut)
  useEffect(() => {
    const handleToggleEvent = () => togglePanel();
    window.addEventListener("toggle-agent-panel", handleToggleEvent);
    return () =>
      window.removeEventListener("toggle-agent-panel", handleToggleEvent);
  }, [togglePanel]);

  return {
    isPanelOpen,
    panelWidth,
    setPanelWidth,
    hasSmallHeader,
    setHasSmallHeader,
    openPanel,
    closePanel,
    togglePanel,
  };
}
