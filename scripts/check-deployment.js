// Read-only deployment checks: exact filename casing, asset references, lockfile consistency and exclusion of local/private files.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname, relative } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const root = fileURLToPath(new URL("../", import.meta.url));
async function exactPath(path) {
  let current = root;
  for (const part of relative(root, path).split("/")) {
    assert.ok(
      (await readdir(current)).includes(part),
      `Missing or incorrectly cased path: ${relative(root, path)}`,
    );
    current = resolve(current, part);
  }
}
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(js|css|html)$/.test(entry.name)) {
      const text = await readFile(path, "utf8");
      for (const match of text.matchAll(
        /(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g,
      ))
        await exactPath(resolve(dirname(path), match[1]));
      for (const match of text.matchAll(
        /["'(](\/public\/[\w./-]+\.[\w]+)(?:[?][^"')\s]*)?["')]/g,
      ))
        await exactPath(resolve(root, "frontend", match[1].slice(1)));
    }
  }
}
await scan(resolve(root, "frontend/src"));
await scan(resolve(root, "backend/src"));
await exactPath(resolve(root, "frontend/index.html"));
const { seedDogs } = await import("../backend/src/seed.js");
for (const dog of seedDogs)
  await exactPath(resolve(root, "frontend", dog.image.split("?")[0].slice(1)));
for (const folder of ["", "backend/"]) {
  const pkg = JSON.parse(
    await readFile(resolve(root, `${folder}package.json`)),
  );
  const lock = JSON.parse(
    await readFile(resolve(root, `${folder}package-lock.json`)),
  );
  assert.deepEqual(
    pkg.dependencies,
    lock.packages[""].dependencies,
    `${folder}dependency declarations must match lockfile`,
  );
}
for (const path of [
  "backend/.env",
  "frontend/.env.production",
  "node_modules/example.js",
  "backend/node_modules/example.js",
  "frontend/.DS_Store",
  "frontend/._image",
  "__MACOSX/example",
]) {
  assert.equal(
    execFileSync("git", ["check-ignore", path], { cwd: root })
      .toString()
      .trim(),
    path,
  );
}
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
  .toString()
  .split("\0");
assert.ok(
  !tracked.some((path) =>
    /(^|\/)(node_modules|__MACOSX)(\/|$)|(^|\/)\.DS_Store$|(^|\/)\._|(^|\/)\.env($|\.(?!example$))/.test(
      path,
    ),
  ),
  "Sensitive/local files must not be tracked",
);
const settings = JSON.parse(
  await readFile(resolve(root, ".vscode/settings.json")),
);
for (const pattern of [
  "**/node_modules/**",
  "**/.env",
  "**/.env.*",
  "**/.DS_Store",
  "**/._*",
  "**/__MACOSX/**",
])
  assert.ok(settings["appService.zipIgnorePattern"].includes(pattern));
console.log(
  "Exact-case imports/assets, seed images, package locks and deployment exclusions passed.",
);
