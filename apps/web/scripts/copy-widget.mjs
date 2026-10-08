// Serves the script embed from this instance at /widget.js, so self-hosted
// installs run the Widget built from this repository rather than the CDN copy.
// Turbo builds @fasterfixes/widget before this app (`^build`), so the IIFE exists.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(appDir, "../../packages/widget/dist/widget.iife.js");
const target = join(appDir, "public/widget.js");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`[web] copied widget.iife.js to public/widget.js`);
