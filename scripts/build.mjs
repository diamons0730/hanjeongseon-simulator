import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "www");
const files = ["index.html", "styles.css", "script.js", "manifest.json", "service-worker.js", "icons"];

await mkdir(output, { recursive: true });
for (const file of files) {
  await cp(resolve(root, file), resolve(output, file), { recursive: true, force: true });
}
console.log(`Web assets copied to ${output}`);
