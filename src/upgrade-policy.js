/**
 * 업그레이드 대상·제외·수동 병합 경로 정책.
 * relPath는 프로젝트 루트 기준 posix 상대 경로.
 */

export const MANIFEST_FILENAME = '.ai-workspace-template.json';

/** 항상 복사 시도(프로젝트와 다르면 충돌 스킵) */
export const MANAGED_PREFIXES = [
  '.cursor/rules/',
  '.cursor/skills/',
  '.cursor/role-prompts/',
  'scripts/agent-runner.mjs',
  'scripts/work.mjs',
  'docs/runbook/',
  'docs/architecture/stack.md',
  'docs/architecture/env-template.md',
  'docs/cursor-agent-setup.md',
  'docs/role-coordination.md',
  'docs/role-prompts/',
  'docs/project-concept-README.md',
  'tasks/README.md',
  'tasks/items/_template.md',
  'design/README.md',
  'design/_template-screen-spec.md',
  'design/_template-visual-direction.md',
  'design/examples/',
  'AGENTS.md',
];

/** 절대 덮어쓰지 않음 — 리포트에 excluded 로만 집계 */
export const EXCLUDED_EXACT = new Set([
  MANIFEST_FILENAME,
  'docs/project-concept.md',
  'docs/coordination-log.md',
  'docs/next-actions.md',
  'tasks/board.json',
]);

export const EXCLUDED_PREFIXES = [
  'docs/specs/',
  'docs/ideas/',
  'docs/feedback/',
  'apps/',
  'node_modules/',
  'dist/',
  '.git/',
];

/** 덮어쓰지 않고 diff만 리포트(수동 병합) */
export const MERGE_ONLY_EXACT = new Set([
  'package.json',
  'pnpm-workspace.yaml',
  'apps/web/package.json',
  'apps/web/next.config.ts',
  'apps/web/vitest.config.ts',
  'apps/web/eslint.config.js',
  'apps/web/tsconfig.json',
  'apps/web/next-env.d.ts',
  'apps/web/.env.example',
  'README.md',
  '.gitignore',
]);

export function classifyPath(relPath) {
  const base = relPath.split('/').pop() ?? relPath;
  if (base.includes('.migrate.') || base.endsWith('.migrate')) return 'excluded';
  if (base.includes('.conflict.') || base.endsWith('.conflict')) return 'excluded';

  if (EXCLUDED_EXACT.has(relPath)) return 'excluded';
  for (const p of EXCLUDED_PREFIXES) {
    if (relPath.startsWith(p)) return 'excluded';
  }
  if (MERGE_ONLY_EXACT.has(relPath)) return 'merge_only';
  if (relPath.startsWith('tasks/items/') && relPath !== 'tasks/items/_template.md') {
    return 'excluded';
  }
  if (
    relPath.startsWith('design/') &&
    !relPath.startsWith('design/examples/') &&
    relPath !== 'design/README.md' &&
    !relPath.startsWith('design/_template')
  ) {
    return 'excluded';
  }
  for (const p of MANAGED_PREFIXES) {
    if (relPath === p.replace(/\/$/, '') || relPath.startsWith(p)) return 'managed';
  }
  return 'not_managed';
}
