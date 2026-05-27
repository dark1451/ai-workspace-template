import fs from 'node:fs';
import path from 'node:path';
import {
  migrateSidecarRelPath,
  pruneOrphanSidecars,
  writeMigrateSidecar,
} from './migrate-sidecar.js';
import {
  diffStats,
  fileSha256,
  fileSha256Normalized,
  firstDifferenceLine,
  normalizeText,
  textSha256,
  unifiedDiff,
} from './diff.js';
import { classifyPath } from './upgrade-policy.js';
import { writeReport } from './upgrade-report.js';
import {
  MANIFEST_FILENAME as SHARED_MANIFEST,
  formatRunId,
  readPackageVersion,
  resolveTemplateRoot,
  toPosixRel,
} from './shared.js';

const SKIP = new Set(['node_modules', '.git', 'dist', '.turbo', '.next']);

function walkFiles(dir, root, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(abs, root, out);
    else out.push(toPosixRel(root, abs));
  }
  return out;
}

function isTextFile(relPath) {
  const bin = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2'];
  return !bin.some((ext) => relPath.endsWith(ext));
}

function readProjectManifest(projectRoot) {
  const p = path.join(projectRoot, SHARED_MANIFEST);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function parseUpgradeArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('-')));
  const positional = argv.filter((a) => a && !a.startsWith('-'));
  return {
    dryRun: flags.has('--dry-run'),
    projectDir: positional[0] ? path.resolve(process.cwd(), positional[0]) : process.cwd(),
  };
}

function buildMergeHint(relPath, sidecarRel, templateRoot, action) {
  const lines = [
    `- **현재(프로젝트)**: \`${relPath}\``,
    `- **템플릿 목표(사이드카)**: \`${sidecarRel}\` — 원본 **바로 옆**에 생성됨`,
    `- IDE Compare: \`${relPath}\` ↔ \`${sidecarRel}\``,
    `- 템플릿 원본 경로(참고): \`${path.join(templateRoot, relPath)}\``,
  ];
  if (action === 'skipped_conflict') {
    lines.push('- 병합 후 프로젝트 파일을 확정하고 **`*.migrate.*` 사이드카는 삭제**하세요.');
  } else {
    lines.push('- 자동 덮어쓰기 없음 — diff의 `+` 줄만 선택 반영 후 사이드카 삭제.');
  }
  return lines.join('\n');
}

function enrichTextDiff(entry, projectPath, templatePath, relPath) {
  const projectText = fs.readFileSync(projectPath, 'utf8');
  const templateText = fs.readFileSync(templatePath, 'utf8');
  const normProject = normalizeText(projectText);
  const normTemplate = normalizeText(templateText);

  entry.projectSha256Normalized = textSha256(normProject);
  entry.templateSha256Normalized = textSha256(normTemplate);
  entry.projectSha256Raw = fileSha256(projectPath);
  entry.templateSha256Raw = fileSha256(templatePath);
  entry.eolOnlyDifference =
    entry.projectSha256Raw !== entry.templateSha256Raw &&
    entry.projectSha256Normalized === entry.templateSha256Normalized;

  if (normProject === normTemplate) {
    entry.firstDiffLine = null;
    entry.diff = null;
    entry.diffStats = { linesAdded: 0, linesRemoved: 0 };
    return;
  }

  entry.firstDiffLine = firstDifferenceLine(projectText, templateText);
  entry.lineCounts = {
    project: normProject.split('\n').length,
    template: normTemplate.split('\n').length,
  };
  entry.diffStats = diffStats(projectText, templateText);
  entry.diff = unifiedDiff(projectText, templateText, relPath);
}

function hashesEqual(projectPath, templatePath, isText) {
  if (!isText) {
    return fileSha256(projectPath) === fileSha256(templatePath);
  }
  return fileSha256Normalized(projectPath) === fileSha256Normalized(templatePath);
}

export async function runUpgrade(argv) {
  const { dryRun, projectDir } = parseUpgradeArgs(argv);
  const templateRoot = resolveTemplateRoot();
  const cliVersion = readPackageVersion();

  if (!fs.existsSync(templateRoot)) {
    console.error('  오류: 템플릿(resource) 없음:', templateRoot);
    process.exit(1);
  }

  const manifest = readProjectManifest(projectDir);
  const fromVersion = manifest?.templateVersion ?? null;
  const toVersion = cliVersion;
  const runId = formatRunId();
  const migrateSidecars = [];

  const templateFiles = walkFiles(templateRoot, templateRoot);
  const entries = [];
  const counts = {
    applied: 0,
    unchanged: 0,
    skipped_conflict: 0,
    merge_manual: 0,
    excluded: 0,
    not_managed: 0,
  };

  console.log('');
  console.log('  ai-workspace-template upgrade');
  console.log(`  프로젝트: ${projectDir}`);
  console.log(`  템플릿: ${templateRoot}`);
  console.log(`  버전: ${toVersion}${dryRun ? ' (dry-run)' : ''}`);
  if (fromVersion) console.log(`  이전 기록: ${fromVersion}`);
  console.log('');

  for (const relPath of templateFiles.sort()) {
    const policy = classifyPath(relPath);
    const templatePath = path.join(templateRoot, relPath);
    const projectPath = path.join(projectDir, relPath);
    const isText = isTextFile(relPath);

    if (policy === 'excluded') {
      counts.excluded++;
      continue;
    }
    if (policy === 'not_managed') {
      counts.not_managed++;
      continue;
    }

    const projectExists = fs.existsSync(projectPath);
    const base = { relPath, policy, projectExists };

    if (policy === 'merge_only') {
      if (!projectExists) {
        const sidecarRel = migrateSidecarRelPath(relPath);
        entries.push({
          ...base,
          action: 'merge_manual',
          reason: '프로젝트에 파일 없음 — 사이드카 또는 템플릿을 참고해 수동 추가',
          migrateSidecar: dryRun ? sidecarRel : undefined,
          mergeHint: `- 신규 파일: \`${relPath}\` 를 만들거나 \`${sidecarRel}\` 내용을 참고`,
          templateSha256Raw: isText ? fileSha256Normalized(templatePath) : fileSha256(templatePath),
        });
        if (!dryRun && isText) {
          const written = writeMigrateSidecar(projectDir, relPath, templatePath);
          entries.at(-1).migrateSidecar = written;
          migrateSidecars.push({ project: relPath, sidecar: written, action: 'merge_manual' });
        }
        counts.merge_manual++;
        continue;
      }

      if (hashesEqual(projectPath, templatePath, isText)) {
        entries.push({
          ...base,
          action: 'unchanged',
          projectSha256Normalized: isText
            ? fileSha256Normalized(projectPath)
            : undefined,
          projectSha256Raw: fileSha256(projectPath),
        });
        counts.unchanged++;
        continue;
      }

      const sidecarRel = migrateSidecarRelPath(relPath);
      const entry = {
        ...base,
        action: 'merge_manual',
        reason: '설정·매니페스트 — 자동 덮어쓰기 금지',
        migrateSidecar: sidecarRel,
        mergeHint: buildMergeHint(relPath, sidecarRel, templateRoot, 'merge_manual'),
      };
      if (isText) enrichTextDiff(entry, projectPath, templatePath, relPath);
      if (!dryRun && isText) {
        writeMigrateSidecar(projectDir, relPath, templatePath);
        migrateSidecars.push({ project: relPath, sidecar: sidecarRel, action: 'merge_manual' });
      }
      entries.push(entry);
      counts.merge_manual++;
      continue;
    }

    if (!projectExists) {
      if (!dryRun) {
        fs.mkdirSync(path.dirname(projectPath), { recursive: true });
        fs.copyFileSync(templatePath, projectPath);
      }
      entries.push({
        ...base,
        action: 'applied',
        reason: '신규 파일',
        templateSha256Normalized: isText
          ? fileSha256Normalized(templatePath)
          : undefined,
        templateSha256Raw: fileSha256(templatePath),
      });
      counts.applied++;
      continue;
    }

    if (hashesEqual(projectPath, templatePath, isText)) {
      entries.push({
        ...base,
        action: 'unchanged',
        projectSha256Normalized: isText
          ? fileSha256Normalized(projectPath)
          : undefined,
        projectSha256Raw: fileSha256(projectPath),
      });
      counts.unchanged++;
      continue;
    }

    const sidecarRel = migrateSidecarRelPath(relPath);
    const entry = {
      ...base,
      action: 'skipped_conflict',
      reason: '프로젝트 ≠ 템플릿 (정규화 후) — 사용자 수정 가능성',
      migrateSidecar: sidecarRel,
      mergeHint: buildMergeHint(relPath, sidecarRel, templateRoot, 'skipped_conflict'),
    };
    if (isText) {
      enrichTextDiff(entry, projectPath, templatePath, relPath);
      if (!dryRun) {
        writeMigrateSidecar(projectDir, relPath, templatePath);
        migrateSidecars.push({ project: relPath, sidecar: sidecarRel, action: 'skipped_conflict' });
      }
    } else {
      entry.projectSha256Raw = fileSha256(projectPath);
      entry.templateSha256Raw = fileSha256(templatePath);
      entry.mergeHint += '\n- (바이너리 — diff 생략, 사이드카 미생성)';
      entry.migrateSidecar = undefined;
    }
    entries.push(entry);
    counts.skipped_conflict++;
  }

  let orphanSidecarsRemoved = [];
  if (!dryRun) {
    orphanSidecarsRemoved = pruneOrphanSidecars(
      projectDir,
      migrateSidecars.map((s) => s.sidecar),
    );
  }

  const result = {
    meta: {
      runId,
      generatedAt: new Date().toISOString(),
      projectRoot: projectDir,
      templateRoot,
      cliVersion,
      fromTemplateVersion: fromVersion,
      toTemplateVersion: toVersion,
      dryRun,
      migrateSidecarPattern:
        '*.migrate | *.migrate.* (예: package.migrate.json, .gitignore.migrate)',
      migrateSidecars,
      orphanSidecarsRemoved,
      reportBasename: `upgrade-report-${runId}`,
    },
    entries,
    counts,
  };

  const { mdRel, jsonRel } = writeReport(projectDir, result, runId);

  if (!dryRun) {
    const merged = {
      schemaVersion: 1,
      packageName: 'create-ai-workspace-template',
      ...(manifest ?? {}),
      templateVersion: toVersion,
      ...(counts.applied > 0
        ? { lastUpgradedAt: new Date().toISOString() }
        : { lastUpgradeCheckedAt: new Date().toISOString() }),
      lastUpgradeReport: mdRel,
      lastUpgradeReportJson: jsonRel,
    };
    fs.writeFileSync(
      path.join(projectDir, SHARED_MANIFEST),
      JSON.stringify(merged, null, 2) + '\n',
      'utf8',
    );
  }

  console.log('  요약');
  console.log(`    적용: ${counts.applied}`);
  console.log(`    동일: ${counts.unchanged}`);
  console.log(`    충돌 스킵: ${counts.skipped_conflict}`);
  console.log(`    수동 병합: ${counts.merge_manual}`);
  console.log('');
  console.log(`  리포트: ${mdRel}`);
  console.log(`  JSON:   ${jsonRel}`);
  if (migrateSidecars.length) {
    console.log(`  migrate 사이드카: ${migrateSidecars.length}개`);
    for (const s of migrateSidecars) {
      console.log(`    ${s.project}  →  ${s.sidecar}`);
    }
  }
  if (orphanSidecarsRemoved.length) {
    console.log(`  제거된 옛 사이드카: ${orphanSidecarsRemoved.length}개`);
    for (const p of orphanSidecarsRemoved) console.log(`    ${p}`);
  }
  console.log('');
}
