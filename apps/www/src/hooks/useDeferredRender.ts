import { useState, useLayoutEffect } from "react";

export function useDeferFirstRender() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  if (typeof window === "undefined") {
    return true;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  return isFirstLoad;
}
