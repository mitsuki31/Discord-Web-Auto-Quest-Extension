import fs from "node:fs/promises";
import path from "node:path"
import { build as esbuild, type BuildOptions } from "esbuild";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const SRC_DIR = path.join(ROOT_DIR, "src");

const IS_PROD = process.argv.slice(2).some(
  x => ["--prod", "--production"].includes(x)
);

console.info(`[#] Build Mode: ${IS_PROD ? "production" : "development"}\n`);

/** Build options for ESBuild */
const buildOptions: BuildOptions = {
  platform: "browser",
  charset: "utf8",
  bundle: true,

  // format: "...",  // <-- this one is explicitly defined below, see `entries`
  target: "chrome120",

  sourcemap: !IS_PROD,  // Set to false for production
  minify: IS_PROD,      // Set to true for production

  legalComments: "inline",
  logLevel: "info",
};

function src(...paths: string[]): string {
  return path.join(SRC_DIR, ...paths);
}


const entries = {
  background: {
    entryPoints: [src("background", "index.ts")],
    format: "esm" as const,
  },

  "quest-home": {
    entryPoints: [src("content", "quest-home.ts")],
    format: "iife" as const,
  },

  "quest-code": {
    entryPoints: [src("content", "quest-code.ts")],
    format: "iife" as const,
  },

  "user-agent-override": {
    entryPoints: [src("userscript", "user-agent-override.ts")],
    format: "iife" as const,
  },
};


async function prebuild(): Promise<void> {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  console.info(
    "[esbuild:prebuild] :: Removed recursively directory",
    `'${path.relative(ROOT_DIR, DIST_DIR)}/'`
  );

  await fs.mkdir(DIST_DIR, { recursive: true });
  console.info(
    "[esbuild:prebuild] :: Created directory",
    `'${path.relative(ROOT_DIR, DIST_DIR)}/'`
  );
}

async function postbuild(): Promise<void> {
  await fs.cp(PUBLIC_DIR, DIST_DIR, {
    recursive: true,
    preserveTimestamps: true,
  });
  console.info("[esbuild:postbuild] :: Copied 'public' to 'dist' directory recursively");
}

async function build(): Promise<void> {
  // -- Pre-build
  await prebuild();
  console.info("[esbuild:prebuild] :: Pre-build completed!");

  console.info("[esbuild:build] :: Building the application...");
  for (const [name, options] of Object.entries(entries)) {
    const outfile = path.join(DIST_DIR, `${name}.js`);

    await esbuild({
      ...buildOptions,
      ...options,

      outfile,
    });
  }

  // Post-build
  await postbuild();
  console.info("[esbuild:postbuild] :: Post-build completed!");
}

await build();
console.info("[esbuild] :: Build completed!");
