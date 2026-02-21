const fs = require("node:fs");
const path = require("node:path");

const chunksDir = path.join(process.cwd(), "node_modules", "vite", "dist", "node", "chunks");
const target = "crypto$2.getRandomValues(new Uint8Array(9))";
const replacement =
  "(crypto$2.getRandomValues ? crypto$2.getRandomValues(new Uint8Array(9)) : crypto$2.webcrypto.getRandomValues(new Uint8Array(9)))";

if (!fs.existsSync(chunksDir)) {
  process.exit(0);
}

const files = fs.readdirSync(chunksDir).filter((file) => file.startsWith("dep-") && file.endsWith(".js"));
let patched = false;

for (const file of files) {
  const filePath = path.join(chunksDir, file);
  const source = fs.readFileSync(filePath, "utf8");
  if (!source.includes(target)) {
    continue;
  }
  const next = source.replace(target, replacement);
  if (next !== source) {
    fs.writeFileSync(filePath, next, "utf8");
    patched = true;
  }
}

if (patched) {
  console.log("Patched Vite crypto.getRandomValues fallback.");
}
