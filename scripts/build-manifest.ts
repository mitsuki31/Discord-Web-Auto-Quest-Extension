import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


type ManifestType = "chrome" | "firefox";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const MANIFEST_FILE = path.join(ROOT_DIR, 'public', 'manifest.json');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_MANIFEST = path.join(DIST_DIR, 'manifest.json');

const RM_DEFAULT = [
  "$schema"
] as const;

const RM_CHROME_FIELDS = [
  "background.scripts"
] as const;

const RM_FIREFOX_FIELDS = [
  "version_name",
  "background.service_worker"
] as const;


// CLI Arguments
type ParsedArgs = {
  use: ManifestType | undefined;
  minify: boolean;
};

function parseArgs(args: NodeJS.Process["argv"]): ParsedArgs {
  const useArgIndex = args.findIndex(a => ['-u', '--use'].includes(a));
  let use: ManifestType | null = null;

  if (useArgIndex !== -1) {
    const value = args[useArgIndex + 1];

    if (!value || value.startsWith('-')) {
      throw new TypeError('Argument -u/--use requires a value [chrome | firefox]');
    }

    if (!['chrome', 'firefox'].includes(value)) {
      throw new TypeError(`Invalid value for -u/--use: "${value}". Expected [chrome | firefox]`);
    }

    use = value as ManifestType;
  }

  return {
    use: use || undefined,
    minify: args.some(v => ['-m', '--minify'].includes(v))
  } satisfies ParsedArgs
}


function stripJsonComments(content: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i++;
      } else if (char === '\n' || char === '\r') {
        result += char;
      }
      continue;
    }

    if (inString) {
      result += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    result += char;
  }

  return result;
}

function loadJson<T = unknown>(
  filePath: string
): T {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf8');

  const cleaned = stripJsonComments(content);

  return JSON.parse(cleaned) as T;
}


function removeField<T extends Record<string, unknown>>(
  obj: T,
  fieldPath: string
): T {
  if (!obj || !fieldPath) return obj;

  const keys = fieldPath.split('.');
  const targetKey = keys.pop()!;

  let current: any = obj;
  let currentPath = '';

  for (const key of keys) {
    if (
      current === null ||
      typeof current !== 'object' ||
      !(key in current)
    ) {
      return obj;
    }

    current = current[key];
    currentPath += '.' + key;
  }

  if (current !== null && typeof current === 'object') {
    if (Array.isArray(current)) {
      const index = Number(targetKey);

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < current.length &&
        String(index) === targetKey
      ) {
        const droppedTarget = current.splice(index, 1);
        console.log(`Dropped an element: ${JSON.stringify(droppedTarget)} (from '${currentPath}')`);
      }
    } else {
      delete current[targetKey];
      console.log(`Removed key: ${JSON.stringify(`${currentPath}.${targetKey}`)}`);
    }
  }

  return obj;
}



function build() {
  const args = process.argv.slice(2);
  const manifest = loadJson<Record<string, any>>(MANIFEST_FILE);
  const parsedArgs = parseArgs(args);

  const selectedRmFields = [
    ...RM_DEFAULT,
    ...(parsedArgs.use === 'firefox' ? RM_FIREFOX_FIELDS : RM_CHROME_FIELDS)
  ];

  let newManifest = structuredClone(manifest) as typeof manifest;
  for (const field of selectedRmFields) {
    newManifest = removeField(newManifest, field);
  }

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(
    DIST_MANIFEST,
    JSON.stringify(newManifest, null, parsedArgs.minify ? 0 : 2),
    'utf8'
  );

  console.log(`Wrote ${path.relative(ROOT_DIR, DIST_MANIFEST)}`);
}

build();

