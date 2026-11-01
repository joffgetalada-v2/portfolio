"use client";

import { useEffect } from "react";

// Vercel Analytics and Speed Insights, loaded once the page has finished loading so neither competes
// with the hero. Speed Insights still gets the earlier metrics from the browser's buffered entries.
export function VercelInsights() {
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      import("@vercel/analytics").then(({ inject }) => inject({ framework: "next" }));
      import("@vercel/speed-insights").then(({ injectSpeedInsights }) =>
        injectSpeedInsights({ framework: "next", route: location.pathname }),
      );
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(start) : setTimeout(start, 200));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
    return () => {
      cancelled = true;
      removeEventListener("load", idle);
    };
  }, []);
  return null;
}
