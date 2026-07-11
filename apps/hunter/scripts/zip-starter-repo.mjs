// Zips the repo-root `starter-repo/` folder into
// `apps/hunter/public/automation-kit/starter-repo.zip` so the automation-kit
// page can offer it as a one-click download. Runs before dev/build so the
// zip always reflects the current source in `starter-repo/` — the zip is a
// generated artifact, not a second copy to maintain by hand.
import { createWriteStream, existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const sourceDir = path.join(repoRoot, "starter-repo");
const outDir = path.resolve(__dirname, "../public/automation-kit");
const outFile = path.join(outDir, "starter-repo.zip");

async function main() {
  if (!existsSync(sourceDir)) {
    console.warn(`[zip-starter-repo] skipped: ${sourceDir} not found`);
    return;
  }
  await mkdir(outDir, { recursive: true });

  await new Promise((resolve, reject) => {
    const output = createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    // Wrap in a top-level `starter-repo/` folder so unzipping doesn't scatter
    // files loose into whatever directory the user unzips into.
    archive.directory(sourceDir, "starter-repo");
    archive.finalize();
  });

  console.log(`[zip-starter-repo] wrote ${path.relative(repoRoot, outFile)} (${(await import("node:fs")).statSync(outFile).size} bytes)`);
}

main().catch((err) => {
  console.error("[zip-starter-repo] failed:", err);
  process.exit(1);
});
