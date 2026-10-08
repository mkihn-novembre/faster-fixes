import "server-only";

import { tigris } from "@better-upload/server/clients";

// Placeholders rather than throwing: this client is built at import, and a
// missing key would break `next build` and test imports that run without
// storage env. Credentials come from the Tigris Vercel Marketplace integration.
export const s3Client = tigris({
  accessKeyId: process.env.TIGRIS_STORAGE_ACCESS_KEY_ID || "missing",
  secretAccessKey: process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY || "missing",
  endpoint: "https://t3.storage.dev",
});
