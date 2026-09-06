import fs from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZipFile } from "yazl";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TMP_DIR = path.join(ROOT_DIR, "tmp");

async function getPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(ROOT_DIR, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  return packageJson.version;
}

function relpath(p: string): string {
  return path.relative(ROOT_DIR, p);
}

async function addDirectory(
  zip: ZipFile,
  directory: string,
  baseDirectory: string,
): Promise<void> {
  const entries = await fs.readdir(directory);

  for (const entry of entries) {
    const filePath = path.join(directory, entry);
    const archivePath = path.relative(baseDirectory, filePath);

    const info = await fs.stat(filePath);

    if (info.isDirectory()) {
      await addDirectory(zip, filePath, baseDirectory);
    } else {
      console.info(`[create-zip] :: Adding '${relpath(filePath)}' to zip file...`);
      zip.addFile(filePath, archivePath);
    }
  }
}

async function createArchive(
  sourceDir: string,
  outputPath: string,
  baseDirectory: string,
): Promise<void> {
  const zip = new ZipFile();
  const output = createWriteStream(outputPath);

  zip.outputStream.pipe(output);

  await addDirectory(zip, sourceDir, baseDirectory);

  zip.end();

  await new Promise<void>((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });
}

async function createProductionZip(): Promise<void> {
  try {
    console.info("[create-zip] :: Starting production zip creation...");

    // Get version from package.json
    const version = await getPackageVersion();
    console.info(`[create-zip] :: Version: ${version}`);

    // Create archive directory name
    const archiveName = `Discord-Auto-Quest-v${version}`;
    const archiveDir = path.join(TMP_DIR, archiveName);
    const distZipPath = path.join(DIST_DIR, `${archiveName}.zip`);

    if (!existsSync(TMP_DIR)) {
      await fs.mkdir(TMP_DIR, { recursive: true });
      console.info(`[create-zip] :: Created temporary directory: ${relpath(TMP_DIR)}`);
    }

    // Create archive directory
    await fs.mkdir(archiveDir, { recursive: true });
    console.info(`[create-zip] :: Created archive directory: ${relpath(archiveDir)}`);

    // Copy files from dist/ to archive directory (excluding .map files)
    const distFiles = await fs.readdir(DIST_DIR);
    for (const file of distFiles) {
      // Skip source map files
      if (file.endsWith(".map")) {
        console.info(`[create-zip] :: Skipping source map: '${file}'`);
        continue;
      }

      const sourcePath = path.join(DIST_DIR, file);
      const destPath = path.join(archiveDir, file);

      const stats = await fs.stat(sourcePath);
      if (stats.isDirectory()) {
        await fs.cp(sourcePath, destPath, { recursive: true });
      } else {
        await fs.copyFile(sourcePath, destPath);
      }

      console.info(`[create-zip] :: Copied: '${file}'`);
    }

    // Create zip archive
    console.info(`[create-zip] :: Creating zip archive: ${relpath(distZipPath)}`);
    console.info("[create-zip] :: Zipping ---------------------- BEGIN");
    await createArchive(archiveDir, distZipPath, path.dirname(archiveDir));
    console.info("[create-zip] :: Zipping ---------------------- DONE");

    // Clean up temporary directory
    await fs.rm(archiveDir, { recursive: true, force: true });
    console.info(`[create-zip] :: Cleaned up temporary directory: ${relpath(archiveDir)}`);

    console.info("[create-zip] :: Production zip creation completed successfully!");
  } catch (error) {
    console.error("[create-zip] :: Error creating production zip:", error);
    // Attempt cleanup even on error
    try {
      await fs.rm(TMP_DIR, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("[create-zip] :: Error during cleanup:", cleanupError);
    }
    process.exit(1);
  }
}

// Execute the function
createProductionZip();
