import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Maybe<T> = T | null | undefined;
type ReturnType = Readonly<{
  active: boolean;
  start: () => void;
  stop: () => void;
}>;

export default function useDelay(
  length = 1000,
  errors: ReadonlyArray<Maybe<string>> = [],
): ReturnType {
  const [active, setActive] = useState(false);
  const start = useCallback(() => setActive(true), []);
  const stop = useCallback(() => setActive(false), []);
  const handle = useRef<Maybe<NodeJS.Timeout>>(null);

  useEffect(() => {
    if (active) {
      const h = setTimeout(stop, length);
      handle.current = h;
      return () => clearTimeout(h);
    }
    if (handle.current) {
      clearTimeout(handle.current);
    }
    return () => {};
  }, [active, length, stop]);
  useEffect(() => {
    const thereAreErrors = errors.some(e => !!e);
    if (thereAreErrors) {
      stop();
    }
  }, [errors, stop]);
  return useMemo(
    () =>
      Object.freeze({
        active,
        start,
        stop,
      }),
    [active, start, stop],
  );
}
