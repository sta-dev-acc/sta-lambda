#!/usr/bin/env node

/**
 * Bundle Lambda function using esbuild
 * This creates a single bundled file for Lambda deployment
 */

import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";

const entryPoint = path.join(
  __dirname,
  "../src/functions/property-creation/handler.ts"
);
const outfile = path.join(__dirname, "../dist/handler.js");

console.log("📦 Bundling Lambda function with esbuild...");

esbuild
  .build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    outfile,
    external: ["aws-sdk"], // AWS SDK is available in Lambda runtime
    sourcemap: false,
    minify: false,
    keepNames: true,
  })
  .then(() => {
    console.log("✅ Bundle created successfully at:", outfile);

    // Copy contract ABI files
    const abiSource = path.join(
      __dirname,
      "../src/contracts/abis/SmartTags.json"
    );
    const abiDest = path.join(
      __dirname,
      "../dist/contracts/abis/SmartTags.json"
    );

    if (fs.existsSync(abiSource)) {
      const abiDir = path.dirname(abiDest);
      if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir, { recursive: true });
      }
      fs.copyFileSync(abiSource, abiDest);
      console.log("✅ Contract ABI copied to dist/contracts/abis/");
    } else {
      console.warn("⚠️  Contract ABI not found at:", abiSource);
    }
  })
  .catch((error: Error) => {
    console.error("❌ Bundling failed:", error);
    process.exit(1);
  });
