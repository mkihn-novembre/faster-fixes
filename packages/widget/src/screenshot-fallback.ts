import type { CaptureViewportScreenshotOptions } from "./screenshot.js";

// Image-heavy pages (galleries, full-size photos) routinely need more than a few
// seconds to inline every image. The submit never awaits the capture, so a
// longer wait only delays the screenshot, not the Reviewer.
export const FULL_CAPTURE_TIMEOUT = 15000;

type CaptureScreenshot = (
  options?: CaptureViewportScreenshotOptions,
) => Promise<Blob | null>;

/**
 * Waits a bounded time for the full capture started on selection, then falls
 * back to a lightweight capture. Resolves to null when neither produced an
 * image; the capture itself logs the warning, so this never rejects.
 */
export async function settleScreenshot(
  pending: Promise<Blob | null> | null,
  capture: CaptureScreenshot,
  timeout = FULL_CAPTURE_TIMEOUT,
): Promise<Blob | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const full = pending
    ? await Promise.race([
        pending.catch(() => null),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => resolve(null), timeout);
        }),
      ])
    : null;
  clearTimeout(timer);
  if (full) return full;
  return capture({ lightweight: true }).catch(() => null);
}
