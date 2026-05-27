import fs from 'node:fs';
import path from 'node:path';

/**
 * `package.json` → `package.migrate.json`
 * `.gitignore` → `.gitignore.migrate`
 * `dir/file.mdc` → `dir/file.migrate.mdc`
 */
export function migrateSidecarRelPath(relPath) {
  const dir = path.dirname(relPath);
  const base = path.basename(relPath);
  const lastDot = base.lastIndexOf('.');

  let sidecarBase;
  if (lastDot <= 0) {
    sidecarBase = `${base}.migrate`;
  } else {
    sidecarBase = `${base.slice(0, lastDot)}.migrate${base.slice(lastDot)}`;
  }

  const rel = dir === '.' ? sidecarBase : `${dir}/${sidecarBase}`;
  return rel.replace(/\\/g, '/');
}

export function isMigrateSidecar(relPath) {
  const base = path.basename(relPath);
  return base.endsWith('.migrate') || base.includes('.migrate.');
}

/** @deprecated 이전 `.conflict` 사이드카 */
export function isLegacyConflictSidecar(relPath) {
  const base = path.basename(relPath);
  return base.endsWith('.conflict') || base.includes('.conflict.');
}

export function isAnyUpgradeSidecar(relPath) {
  return isMigrateSidecar(relPath) || isLegacyConflictSidecar(relPath);
}

const PRUNE_SKIP = new Set(['node_modules', '.git', 'dist', '.turbo', '.next']);

/** 이번 run 에 없는 옛 사이드카(.migrate / .conflict) 제거 */
export function pruneOrphanSidecars(projectDir, keepSidecarRels) {
  const keep = new Set(keepSidecarRels);
  const removed = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (PRUNE_SKIP.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      const rel = path.relative(projectDir, abs).split(path.sep).join('/');
      if (!isAnyUpgradeSidecar(rel) || keep.has(rel)) continue;
      fs.unlinkSync(abs);
      removed.push(rel);
    }
  }

  if (fs.existsSync(projectDir)) walk(projectDir);
  return removed;
}

/** 템플릿 내용을 프로젝트 트리 안 사이드카로 기록 */
export function writeMigrateSidecar(projectDir, relPath, templatePath) {
  const sidecarRel = migrateSidecarRelPath(relPath);
  const dest = path.join(projectDir, sidecarRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(templatePath, dest);
  return sidecarRel;
}
