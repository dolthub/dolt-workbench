import { useEffectAsync } from "@dolthub/react-hooks";
import { useState } from "react";

export type UserHeaders = {
  user?: string;
  email?: string;
};

export function useUserHeaders(): UserHeaders | null {
  const [headers, setHeaders] = useState<UserHeaders | null>(null);

  useEffectAsync(async () => {
     // For Electron, use IPC to fetch headers, otherwise use API, since api routes are not available in Electron
    if ( process.env.NEXT_PUBLIC_FOR_ELECTRON === "true"){
    const headersData: any = window.ipc.invoke("get-headers", {});
    const user = headersData["x-forwarded-user"];
    const email = headersData["x-forwarded-email"];
    if (user || email) {
      setHeaders({ user, email });
    }}else{
      const fetchHeaders = async () => {
        const response = await fetch("/api/headers"); // This endpoint should return headers
        const headersData = await response.json();
        const user = headersData["x-forwarded-user"];
        const email = headersData["x-forwarded-email"];
        if (user || email) {
          setHeaders({ user, email });
        }
      };
      await fetchHeaders();
    }
  }, []);

  return headers;
}
