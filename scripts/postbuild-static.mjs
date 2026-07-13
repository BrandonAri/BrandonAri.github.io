import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../dist/client/", import.meta.url));
const viewport = "width=device-width, initial-scale=1";
const coveredViewport = `${viewport}, viewport-fit=cover`;

async function patchDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return patchDirectory(path);
      if (!entry.name.endsWith(".html") && !entry.name.endsWith(".rsc")) return;

      const source = await readFile(path, "utf8");
      if (!source.includes(viewport) || source.includes(coveredViewport)) return;
      await writeFile(path, source.replaceAll(viewport, coveredViewport));
    }),
  );
}

await patchDirectory(outputDirectory);
