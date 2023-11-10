import { useRouter } from "next/router";
import useEffectOnMount from "./useEffectOnMount";

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
