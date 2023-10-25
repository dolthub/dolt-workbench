import { DependencyList, useEffect } from "react";

// Prevents useEffect from attempting to update state of unmounted component
// Reference: https://dmitripavlutin.com/react-cleanup-async-effects/
export default function useEffectAsync(
  fn: (s: { subscribed: boolean }) => Promise<void>,
  deps: DependencyList = [],
) {
  useEffect(() => {
    const data = { subscribed: true };
    fn(data).catch(console.error);
    return () => {
      data.subscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
