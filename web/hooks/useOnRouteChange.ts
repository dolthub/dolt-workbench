import { useEffectOnMount } from "@dolthub/react-hooks";
import { useRouter } from "next/router";

// Do something on route change
export default function useOnRouteChange(onRouteChange: (url: string) => void) {
  const router = useRouter();

  useEffectOnMount(() => {
    const handleRouteChange = (url: string) => {
      onRouteChange(url);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  });
}
