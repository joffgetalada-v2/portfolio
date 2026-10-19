import type { FaceId } from "../book-config";
import { W, type Page } from "./draw-utils";
import { drawContact, drawExperience, drawProcess, drawToolkit } from "./faces/back";
import { drawBackCover, drawCover } from "./faces/covers";
import { drawContents, drawIntro } from "./faces/front";
import { drawAtomic, drawMalbon } from "./faces/golf";
import { drawArtisan, drawFreelance } from "./faces/practice";
import { drawTimexDetail, drawTimexHero } from "./faces/timex";
import type { DrawContext, FaceRegistry, FaceSpec } from "./types";

function face(fn: (p: Page) => void, animated = true): FaceSpec {
  return {
    animated,
    draw: ({ ctx, w, h, t, fonts, image }: DrawContext) => {
      const s = w / W;
      ctx.save();
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      fn({ ctx, t: Math.max(0, t), fonts, image, pw: w, ph: h, s });
      ctx.restore();
    },
  };
}

export const faces: FaceRegistry = {
  cover: face(drawCover),
  contents: face(drawContents),
  intro: face(drawIntro),
  "timex-hero": face(drawTimexHero),
  "timex-detail": face(drawTimexDetail),
  malbon: face(drawMalbon),
  atomic: face(drawAtomic),
  artisan: face(drawArtisan),
  freelance: face(drawFreelance),
  toolkit: face(drawToolkit),
  experience: face(drawExperience),
  process: face(drawProcess),
  contact: face(drawContact),
  "back-cover": face(drawBackCover),
} satisfies Record<FaceId, FaceSpec>;
