import fs from 'node:fs';
import path from 'node:path';
import { formatRunId } from './shared.js';

function section(title, lines) {
  if (!lines.length) return '';
  return `## ${title}\n\n${lines.join('\n\n')}\n\n`;
}

function entryBlock(e) {
  const sidecar = e.migrateSidecar ?? e.templateSidecar;
  const lines = [
    `### \`${e.relPath}\``,
    '',
    '| 필드 | 값 |',
    '|------|-----|',
    `| action | \`${e.action}\` |`,
    `| policy | \`${e.policy}\` |`,
  ];
  if (e.reason) lines.push(`| reason | ${e.reason} |`);
  if (e.projectExists != null) lines.push(`| projectExists | ${e.projectExists} |`);
  if (sidecar) lines.push(`| migrateSidecar | \`${sidecar}\` |`);
  if (e.eolOnlyDifference) {
    lines.push('| eolOnlyDifference | true (내용 동일, 줄바꿈만 다름) |');
  }
  if (e.projectSha256Normalized) {
    lines.push(`| projectSha256 (normalized) | \`${e.projectSha256Normalized}\` |`);
  }
  if (e.templateSha256Normalized) {
    lines.push(`| templateSha256 (normalized) | \`${e.templateSha256Normalized}\` |`);
  }
  if (e.projectSha256Raw) lines.push(`| projectSha256 (raw file) | \`${e.projectSha256Raw}\` |`);
  if (e.templateSha256Raw) lines.push(`| templateSha256 (raw file) | \`${e.templateSha256Raw}\` |`);
  if (e.firstDiffLine != null) lines.push(`| firstDiffLine | ${e.firstDiffLine} |`);
  if (e.diffStats) {
    lines.push(
      `| linesRemoved (project→template) | ${e.diffStats.linesRemoved} |`,
      `| linesAdded (project→template) | ${e.diffStats.linesAdded} |`,
    );
  }
  if (e.lineCounts) {
    lines.push(
      `| projectLines | ${e.lineCounts.project} |`,
      `| templateLines | ${e.lineCounts.template} |`,
    );
  }
  if (e.mergeHint) lines.push('', `**병합 힌트**`, '', e.mergeHint);
  if (e.diff) {
    lines.push('', '```diff', e.diff, '```');
  }
  return lines.join('\n');
}

function buildQuickRefTable(conflicts, mergeOnly) {
  const rows = [...conflicts, ...mergeOnly];
  if (!rows.length) return '';
  const header = [
    '## 병합 대상 한눈에 보기',
    '',
    '| action | project | migrate sidecar | firstLine | + / - |',
    '|--------|---------|-----------------|-----------|-------|',
  ];
  const body = rows.map((e) => {
    const stats = e.diffStats
      ? `+${e.diffStats.linesAdded} / -${e.diffStats.linesRemoved}`
      : '(no diff)';
    const line = e.firstDiffLine ?? '-';
    const sidecar = e.migrateSidecar ?? e.templateSidecar ?? '-';
    return `| \`${e.action}\` | \`${e.relPath}\` | \`${sidecar}\` | ${line} | ${stats} |`;
  });
  return [...header, ...body, ''].join('\n');
}

export function buildReportMarkdown(result) {
  const { meta, entries, counts } = result;
  const applied = entries.filter((e) => e.action === 'applied');
  const unchanged = entries.filter((e) => e.action === 'unchanged');
  const conflicts = entries.filter((e) => e.action === 'skipped_conflict');
  const mergeOnly = entries.filter((e) => e.action === 'merge_manual');
  const added = entries.filter((e) => e.action === 'applied' && !e.projectExists);

  const intro = [
    '# ai-workspace-template 업그레이드 리포트',
    '',
    '> 충돌·수동 병합 시 템플릿 내용은 원본 **옆** `*.migrate.*` 파일로 둡니다. IDE에서 `파일` ↔ `파일.migrate.ext` Compare.',
    '',
    '| 항목 | 값 |',
    '|------|-----|',
    `| runId | \`${meta.runId}\` |`,
    `| generatedAt | ${meta.generatedAt} |`,
    `| projectRoot | \`${meta.projectRoot}\` |`,
    `| templateRoot | \`${meta.templateRoot}\` |`,
    `| cliVersion | ${meta.cliVersion} |`,
    `| fromTemplateVersion | ${meta.fromTemplateVersion ?? '(없음)'} |`,
    `| toTemplateVersion | ${meta.toTemplateVersion} |`,
    `| dryRun | ${meta.dryRun} |`,
    `| migrateSidecarPattern | ${meta.migrateSidecarPattern ?? ''} |`,
    `| orphanSidecarsRemoved | ${(meta.orphanSidecarsRemoved ?? []).length} |`,
    `| mdReport | \`docs/upgrade-report-${meta.runId}.md\` |`,
    `| jsonReport | \`docs/upgrade-report-${meta.runId}.json\` |`,
    '',
    '## 요약',
    '',
    '| 구분 | 건수 |',
    '|------|------|',
    `| 적용 (applied) | ${counts.applied} |`,
    `| 신규 추가 | ${added.length} |`,
    `| 동일 (unchanged) | ${counts.unchanged} |`,
    `| 충돌 스킵 (skipped_conflict) | ${counts.skipped_conflict} |`,
    `| 수동 병합 (merge_manual) | ${counts.merge_manual} |`,
    `| 정책 제외 (excluded) | ${counts.excluded} |`,
    `| 비관리 (not_managed) | ${counts.not_managed} |`,
    '',
    buildQuickRefTable(conflicts, mergeOnly),
    '## 수동 병합 절차',
    '',
    '1. **병합 대상 한눈에 보기** 표에서 `migrate sidecar` 경로 확인.',
    '2. IDE Compare: `relPath` (현재) ↔ `*.migrate.*` (템플릿 목표).',
    '3. unified diff: `--- project/` = 현재, `+++ template/` = 목표.',
    '4. 병합 완료 후 **migrate 사이드카 삭제** (`.gitignore`에 포함).',
    '5. `eolOnlyDifference: true` → 줄바꿈만 정리.',
    '6. `pnpm install`, `pnpm test:run`.',
    '',
  ].join('\n');

  const unchangedSummary =
    unchanged.length === 0
      ? ''
      : [
          '## 변경 없음 (unchanged)',
          '',
          `${unchanged.length}개 — JSON \`entries[]\` / \`action: "unchanged"\` 참고.`,
          '',
          unchanged.length <= 8
            ? unchanged.map((e) => `- \`${e.relPath}\``).join('\n')
            : [
                ...unchanged.slice(0, 5).map((e) => `- \`${e.relPath}\``),
                `- … 외 ${unchanged.length - 5}개`,
              ].join('\n'),
          '',
        ].join('\n');

  return (
    intro +
    section('적용됨 (applied)', applied.map(entryBlock)) +
    section('충돌 — 스킵됨 (skipped_conflict)', conflicts.map(entryBlock)) +
    section('수동 병합 — diff만 (merge_manual)', mergeOnly.map(entryBlock)) +
    unchangedSummary +
    section('정책 참고', [
      `제외(excluded): ${counts.excluded}개`,
      `비관리(not_managed): ${counts.not_managed}개`,
    ]) +
    ((meta.orphanSidecarsRemoved ?? []).length
      ? section(
          '제거된 옛 사이드카',
          meta.orphanSidecarsRemoved.map((p) => `- \`${p}\``),
        )
      : '')
  );
}

export function writeReport(projectRoot, result, runId) {
  const id = runId ?? result.meta.runId ?? formatRunId();
  const mdName = `upgrade-report-${id}.md`;
  const jsonName = `upgrade-report-${id}.json`;
  const docsDir = path.join(projectRoot, 'docs');
  fs.mkdirSync(docsDir, { recursive: true });

  const mdPath = path.join(docsDir, mdName);
  const jsonPath = path.join(docsDir, jsonName);
  const jsonRel = `docs/${jsonName}`;
  const mdRel = `docs/${mdName}`;

  result.meta.runId = id;
  result.meta.jsonRel = jsonRel;
  result.meta.mdRel = mdRel;

  const md = buildReportMarkdown(result);
  fs.writeFileSync(mdPath, md, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n', 'utf8');

  return { mdPath, jsonPath, mdRel, jsonRel };
}
