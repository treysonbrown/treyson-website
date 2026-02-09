import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const distAssetsDir = path.resolve(process.cwd(), "dist", "assets");
const distIndexHtml = path.resolve(process.cwd(), "dist", "index.html");

const DEV_JSX_PATTERNS = [
  /\b_jsxDEV\b/,
  /react\/jsx-dev-runtime/,
];

async function main() {
  // #region agent log — build environment diagnostics
  console.log("[verify] NODE_ENV:", process.env.NODE_ENV);
  console.log("[verify] cwd:", process.cwd());
  console.log("[verify] dist assets dir:", distAssetsDir);
  // #endregion

  let entries;
  try {
    entries = await readdir(distAssetsDir, { withFileTypes: true });
  } catch (error) {
    console.error(`Could not read bundle directory: ${distAssetsDir}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const jsFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => path.join(distAssetsDir, entry.name));

  // #region agent log — bundle file list
  console.log("[verify] JS files found:", jsFiles.map((f) => path.basename(f)));
  // #endregion

  if (jsFiles.length === 0) {
    console.error("No JS assets found in dist/assets. Build output is incomplete.");
    process.exit(1);
  }

  for (const filePath of jsFiles) {
    const source = await readFile(filePath, "utf8");
    const matchedPattern = DEV_JSX_PATTERNS.find((pattern) => pattern.test(source));
    if (matchedPattern) {
      console.error(`Dev JSX runtime marker found in ${filePath}`);
      console.error(`Matched pattern: ${matchedPattern}`);
      process.exit(1);
    }
    // #region agent log — bundle JSX runtime check
    const hasProductionJsx = /react-jsx-runtime\.production/.test(source);
    console.log(`[verify] ${path.basename(filePath)}: size=${source.length}, productionJsx=${hasProductionJsx}`);
    // #endregion
  }

  // #region agent log — verify dist/index.html script tags
  try {
    const html = await readFile(distIndexHtml, "utf8");
    const scriptMatch = html.match(/<script[^>]*src="([^"]+)"/);
    console.log("[verify] dist/index.html script src:", scriptMatch ? scriptMatch[1] : "NOT FOUND");
    if (html.includes("/src/main.tsx")) {
      console.error("[verify] ERROR: dist/index.html still references raw /src/main.tsx!");
      process.exit(1);
    }
  } catch (e) {
    console.error("[verify] Could not read dist/index.html:", e.message);
    process.exit(1);
  }
  // #endregion

  console.log("Bundle verification passed: no dev JSX runtime markers found.");
}

void main();
