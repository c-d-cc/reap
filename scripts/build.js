#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version;

execSync(
  `bun build src/cli/index.ts --outfile dist/cli.js --target node --define 'process.env.__REAP_VERSION__="${version}"'`,
  { stdio: "inherit" }
);

execSync("rm -rf dist/templates && cp -r src/templates dist/templates", {
  stdio: "inherit",
});

// Ensure brainstorm server script is executable
execSync("chmod +x dist/templates/brainstorm/start-server.sh", {
  stdio: "inherit",
});
