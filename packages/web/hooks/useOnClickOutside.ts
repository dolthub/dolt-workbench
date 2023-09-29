import React, { useEffect } from "react";

// Executes action when there is a click outside the excluding ref (used for
// closing dropdowns for outside clicks)

export default function useOnClickOutside(
  excludingRef: React.MutableRefObject<any>,
  action: () => void,
) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!e.target || e.composedPath().includes(excludingRef.current)) {
        return;
      }
      action();
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [action, excludingRef]);
}
