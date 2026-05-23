#!/usr/bin/env node
// 🖤 ONYX — Your Personal AI. Forked from OpenClaw.
process.env.ONYX_ENV = "true";
process.env.OPENCLAW_BRAND = "onyx";

const { existsSync, readFileSync } = await import("node:fs");
const { fileURLToPath } = await import("node:url");
const path = await import("node:path");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getVersion() {
  try {
    return JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf8")).version || "dev";
  } catch { return "dev"; }
}

const noBanner = process.argv.includes("--no-banner") || process.argv.includes("--json");
if (!noBanner) {
  const args = process.argv.slice(2).filter(a => !a.startsWith("--no-banner"));
  if (args.length === 0 || args.some(a => a === "--help")) {
    console.error(  🖤  ONYX v  —  Your Personal AI);
  }
}

// Delegate to OpenClaw core
await import(path.join(__dirname, "openclaw.mjs"));
