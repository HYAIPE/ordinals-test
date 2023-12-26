/* eslint-disable react-hooks/rules-of-hooks */
// based off of https://github.com/franciscop/use-animation-frame/blob/master/src/index.js
// Based off a tweet and codesandbox:
// https://mobile.twitter.com/hieuhlc/status/1164369876825169920
import { useCallback, useLayoutEffect, useRef } from "react";
type CB = ({ time, delta }: { time: number; delta: number }) => void;
// Reusable component that also takes dependencies
export default function useAnimationRef(cb: CB) {
  if (typeof performance === "undefined" || typeof window === "undefined") {
    return;
  }

  const cbRef = useRef<CB>();
  const frame = useRef<number>();
  const init = useRef(performance.now());
  const last = useRef(performance.now());

  cbRef.current = cb;

  const animate = useCallback((now: number) => {
    // In seconds ~> you can do ms or anything in userland
    cbRef.current?.({
      time: (now - init.current) / 1000,
      delta: (now - last.current) / 1000,
    });
    last.current = now;
    frame.current = requestAnimationFrame(animate);
  }, []);

  useLayoutEffect(() => {
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [animate]);
}
