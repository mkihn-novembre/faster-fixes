/**
 * Serves organization logos and user avatars from a private bucket. Client
 * components build asset URLs as `${NEXT_PUBLIC_STORAGE_BASE_URL}/${key}`;
 * pointing that base at `/api/assets` lands them here, and this route redirects
 * to a short-lived signed URL. Feedback screenshots are signed by their own
 * services and stay out of reach of this route.
 */

import { auth } from "@/server/auth";
import { getSignedAssetUrl } from "@/server/storage/get-signed-asset-url";
import { requireEnv } from "@/utils/environment/require-env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_KEY_PREFIXES = ["organization-logos/", "user-avatars/"];

// Shorter than the signature so a cached redirect never points at an expired URL.
const SIGNED_URL_TTL_SECONDS = 3600;
const REDIRECT_CACHE_SECONDS = 3000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = (await params).key.join("/");
  if (
    key.includes("..") ||
    !PUBLIC_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getSignedAssetUrl(
    {
      key,
      bucket: requireEnv(
        "STORAGE_BUCKET_NAME",
        process.env.STORAGE_BUCKET_NAME,
      ),
    },
    SIGNED_URL_TTL_SECONDS,
  );

  const response = NextResponse.redirect(url, 302);
  response.headers.set(
    "Cache-Control",
    `private, max-age=${REDIRECT_CACHE_SECONDS}`,
  );
  return response;
}
