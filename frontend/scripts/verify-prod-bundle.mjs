import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const distAssetsDir = path.resolve(process.cwd(), "dist", "assets");

const DEV_JSX_PATTERNS = [
  /\b_jsxDEV\b/,
  /react\/jsx-dev-runtime/,
];

async function main() {
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
  }

  console.log("Bundle verification passed: no dev JSX runtime markers found.");
}

void main();
