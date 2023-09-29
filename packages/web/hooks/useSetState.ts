import React, { useReducer } from "react";

export default function useSetState<S extends Record<string, unknown>>(
  initialState: S,
): [S, React.Dispatch<Partial<S>>] {
  const reducer = (s: S, a: Partial<S>) => {
    return { ...s, ...a };
  };
  return useReducer(reducer, initialState);
}
