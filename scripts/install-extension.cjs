#!/usr/bin/env node

const { execSync } = require("node:child_process");
const { readdirSync, statSync } = require("node:fs");

const vsix = readdirSync(".")
  .filter((f) => f.endsWith(".vsix"))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];

if (!vsix) {
  console.error("No .vsix found. Run: npm run ext:package");
  process.exit(1);
}

console.log("Installing", vsix);
execSync(`code --install-extension ${vsix}`, { stdio: "inherit" });
