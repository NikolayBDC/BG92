import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const distDir = path.resolve(projectRoot, "dist");
const clientDir = path.join(distDir, "client");
const serverDir = path.join(distDir, "server");

if (distDir === projectRoot || !distDir.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error("Refusing to clean an unsafe build directory");
}

await rm(distDir, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });
await mkdir(serverDir, { recursive: true });

const publicFiles = [
  "index.html",
  "diagnostic.html",
  "coding.html",
  "carplay.html",
  "chiptuning.html",
  "retrofit.html",
  "remote.html",
  "blog.html",
  "privacy.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "google7650b878060df945.html",
  "yandex_942df48e7ba237a4.html"
];

await Promise.all(publicFiles.map(file => copyFile(
  path.join(projectRoot, file),
  path.join(clientDir, file)
)));

await cp(path.join(projectRoot, "assets"), path.join(clientDir, "assets"), { recursive: true });
await copyFile(path.join(projectRoot, "worker", "index.js"), path.join(serverDir, "index.js"));

console.log(`Static site built: ${publicFiles.length} pages/files + assets`);
