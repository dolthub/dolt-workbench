import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useEffectOnMount from "./useEffectOnMount";

type ReturnType = [string, Dispatch<SetStateAction<string>>];

// Session state only stores strings
export default function useStateWithSessionStorage(
  storageKey: string,
  defaultValue?: string,
): ReturnType {
  const [value, setValue] = useState("");

  useEffectOnMount(() => {
    if (typeof sessionStorage === "undefined") return;
    setValue(sessionStorage.getItem(storageKey) ?? defaultValue ?? "");
  });

  useEffect(() => {
    sessionStorage.setItem(storageKey, value);
  }, [value, storageKey]);

  return [value, setValue];
}
