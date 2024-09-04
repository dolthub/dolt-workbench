import { useEffectAsync } from "@dolthub/react-hooks";
import { useState } from "react";

export type UserHeaders = {
  user?: string;
  email?: string;
};

export function useUserHeaders(): UserHeaders | null {
  const [headers, setHeaders] = useState<UserHeaders | null>(null);

  useEffectAsync(async () => {
    const headersData: any = window.ipc.invoke("get-headers", {});
    const user = headersData["x-forwarded-user"];
    const email = headersData["x-forwarded-email"];
    if (user || email) {
      setHeaders({ user, email });
    }
  }, []);

  return headers;
}
