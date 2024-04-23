import { useEffectAsync } from "@dolthub/react-hooks";
import { useState } from "react";

export type UserHeaders = {
  user?: string;
  email?: string;
};

export function useUserHeaders(): UserHeaders | null {
  const [headers, setHeaders] = useState<UserHeaders | null>(null);

  useEffectAsync(async () => {
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
  }, []);

  return headers;
}
