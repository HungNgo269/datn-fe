//chat gpt for auto import allias @/app/ dont really know it gonna work or not
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const appRoot = path.resolve(repoRoot, "app");

/**
 * Recursively list files under dir matching extensions
 */
function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip build output or node_modules if nested
      if (e.name === "node_modules" || e.name === ".next") continue;
      yield* walk(p);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      yield p;
    }
  }
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function rewriteSpec(filePath, spec) {
  if (!spec.startsWith(".")) return null; // only relative
  const fromDir = path.dirname(filePath);
  const resolved = path.resolve(fromDir, spec);
  // Only rewrite if target is under app/
  if (!toPosix(resolved).startsWith(toPosix(appRoot) + "/")) return null;
  const relToApp = toPosix(path.relative(appRoot, resolved));
  return `@/app/${relToApp}`;
}

// Patterns to match import/export/dynamic import specifiers
const patterns = [
  // import ... from '...'
  {
    regex: /(import\s+[^'";]+?from\s+["'])(\.{1,2}\/[^"']*)(["'])/g,
    replace: (file, p1, spec, p3) => {
      const np = rewriteSpec(file, spec);
      return np ? `${p1}${np}${p3}` : null;
    },
  },
  // side-effect imports: import '...'
  {
    regex: /(import\s*["'])(\.{1,2}\/[^"']*)(["'])/g,
    replace: (file, p1, spec, p3) => {
      const np = rewriteSpec(file, spec);
      return np ? `${p1}${np}${p3}` : null;
    },
  },
  // export ... from '...'
  {
    regex: /(export\s+[^'";]+?from\s+["'])(\.{1,2}\/[^"']*)(["'])/g,
    replace: (file, p1, spec, p3) => {
      const np = rewriteSpec(file, spec);
      return np ? `${p1}${np}${p3}` : null;
    },
  },
  // dynamic import('...')
  {
    regex: /(import\(\s*["'])(\.{1,2}\/[^"']*)(["']\s*\))/g,
    replace: (file, p1, spec, p3) => {
      const np = rewriteSpec(file, spec);
      return np ? `${p1}${np}${p3}` : null;
    },
  },
];

const changed = [];

for (const file of walk(appRoot)) {
  const src = fs.readFileSync(file, "utf8");
  let out = src;
  let any = false;
  for (const pat of patterns) {
    out = out.replace(pat.regex, (...args) => {
      const match = args[0];
      const p1 = args[1];
      const spec = args[2];
      const p3 = args[3];
      const res = pat.replace(file, p1, spec, p3);
      if (res) {
        any = true;
        return res;
      }
      return match;
    });
  }
  if (any && out !== src) {
    fs.writeFileSync(file, out, "utf8");
    changed.push(path.relative(repoRoot, file));
  }
}

if (changed.length) {
  console.log(`Rewrote ${changed.length} file(s):`);
  for (const f of changed) console.log(` - ${f}`);
  process.exit(0);
} else {
  console.log("No changes needed.");
}
