import { useEffect, useState } from "react";

type ReturnType = {
  setScrollToTop: (t: boolean) => void;
  setRefocus: (r: boolean) => void;
};

export default function useFocus(containerId = "main-content"): ReturnType {
  const [scrollToTop, setScrollToTop] = useState(false);
  const [refocus, setRefocus] = useState(false);

  useEffect(() => {
    const main = document.getElementById(containerId);
    if (scrollToTop) {
      // For some reason only one of these will work for some scroll containers
      main?.scrollIntoView();
      main?.scrollTo({ top: 0, behavior: "smooth" });
      setScrollToTop(false);
    }
    if (refocus) {
      setRefocus(false);
    }
    main?.focus();
  }, [scrollToTop, setScrollToTop, refocus, setRefocus, containerId]);

  return Object.freeze({ setScrollToTop, setRefocus });
}
