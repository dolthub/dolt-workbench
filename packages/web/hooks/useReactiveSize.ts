import { useEffect, useState } from "react";
import useEffectOnMount from "./useEffectOnMount";

export function useReactiveWidth<E extends HTMLElement>(
  elem?: E | null,
  mobileBreakpoint = 768,
): { clientWidth: E["clientWidth"]; isMobile: boolean } {
  const [clientWidth, setClientWidth] = useState(
    elem?.clientWidth ?? window.innerWidth,
  );

  useEffectOnMount(() => {
    const handleResize = () =>
      setClientWidth(elem?.clientWidth ?? window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  useEffect(() => {
    if (elem) {
      setClientWidth(elem.clientWidth);
    }
  }, [elem]);

  const isMobile = !(clientWidth >= mobileBreakpoint);

  return { clientWidth, isMobile };
}
