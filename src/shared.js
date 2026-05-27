import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '..');

export const SKIP_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  '.next',
]);

export const MANIFEST_FILENAME = '.ai-workspace-template.json';

export function resolveTemplateRoot() {
  const bundled = path.join(repoRoot, 'resource');
  if (fs.existsSync(bundled)) return bundled;
  return path.join(repoRoot, 'project-resource', 'template');
}

export function readPackageVersion() {
  const raw = fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8');
  return JSON.parse(raw).version;
}

export function copyTemplateDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyTemplateDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

export function writeProjectManifest(dest, templateVersion) {
  const manifest = {
    schemaVersion: 1,
    templateVersion,
    createdAt: new Date().toISOString(),
    packageName: 'create-ai-workspace-template',
  };
  fs.writeFileSync(
    path.join(dest, MANIFEST_FILENAME),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );
}

export function toPosixRel(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

/** 리포트·스테이징 디렉터리 공통 ID (동일 실행 내 1개) */
export function formatRunId(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}
