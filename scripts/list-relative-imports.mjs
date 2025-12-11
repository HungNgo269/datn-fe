import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.resolve(root, "app");

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      yield* walk(p);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      yield p;
    }
  }
}

const patterns = [
  /(import\s+[^'";]+?from\s+["'])(\.{1,2}\/[^"']*)(["'])/g,
  /(import\s*["'])(\.{1,2}\/[^"']*)(["'])/g,
  /(export\s+[^'";]+?from\s+["'])(\.{1,2}\/[^"']*)(["'])/g,
  /(import\(\s*["'])(\.{1,2}\/[^"']*)(["']\s*\))/g,
];

let count = 0;
for (const file of walk(appRoot)) {
  const src = fs.readFileSync(file, "utf8");
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src)) !== null) {
      const spec = m[2];
      const resolved = path.resolve(path.dirname(file), spec);
      if (resolved.startsWith(appRoot)) {
        console.log(
          `${path.relative(root, file)}:${
            src.slice(0, m.index).split(/\n/).length
          }`
        );
        console.log(`  ${m[0]}`);
        count++;
      }
    }
  }
}

if (count === 0) console.log("No relative imports under app/.");
