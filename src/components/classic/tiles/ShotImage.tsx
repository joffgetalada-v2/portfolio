"use client";

import Image from "next/image";
import { useState } from "react";
import type { SiteShot } from "@/content/profile";

// data-ready gates the scroll motion in globals.css: mobile Chrome doesn't repaint a moving layer
// when its lazy image arrives late.
export function ShotImage({ shot, sizes }: { shot: SiteShot; sizes: string }) {
  const [ready, setReady] = useState(false);
  return (
    <Image
      src={shot.src}
      width={shot.width}
      height={shot.height}
      sizes={sizes}
      loading="lazy"
      alt={`Screenshot of the ${shot.site} home page`}
      className="block h-auto w-full select-none"
      draggable={false}
      onLoad={() => setReady(true)}
      data-ready={ready ? "" : undefined}
    />
  );
}
