import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createTwoFilesPatch, diffLines } from 'diff';

/** 비교·diff용 LF 통일 (CRLF false conflict 방지) */
export function normalizeText(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function textSha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function fileSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

export function fileSha256Normalized(filePath) {
  const text = normalizeText(fs.readFileSync(filePath, 'utf8'));
  return textSha256(text);
}

export function readNormalizedFile(filePath) {
  return normalizeText(fs.readFileSync(filePath, 'utf8'));
}

/**
 * @param {string} projectText — 프로젝트(현재) 내용
 * @param {string} templateText — 템플릿(목표) 내용
 */
export function unifiedDiff(projectText, templateText, relPath, { context = 3, maxLines = 200 } = {}) {
  const a = normalizeText(projectText);
  const b = normalizeText(templateText);
  if (a === b) return null;

  const patch = createTwoFilesPatch(
    `project/${relPath}`,
    `template/${relPath}`,
    a,
    b,
    '',
    '',
    { context },
  );

  const lines = patch.split('\n');
  if (lines.length <= maxLines) return patch;
  return (
    lines.slice(0, maxLines).join('\n') +
    `\n... (diff truncated, ${lines.length - maxLines} lines omitted — see *.migrate.* sidecar or re-run upgrade)`
  );
}

/** 첫 불일치 줄 (1-based), 정규화 후 */
export function firstDifferenceLine(projectText, templateText) {
  const a = normalizeText(projectText).split('\n');
  const b = normalizeText(templateText).split('\n');
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i + 1;
  }
  return null;
}

export function diffStats(projectText, templateText) {
  const changes = diffLines(normalizeText(projectText), normalizeText(templateText));
  let linesAdded = 0;
  let linesRemoved = 0;
  for (const part of changes) {
    const n = part.count ?? part.value.split('\n').length - (part.value.endsWith('\n') ? 0 : 1);
    if (part.added) linesAdded += n;
    if (part.removed) linesRemoved += n;
  }
  return { linesAdded, linesRemoved };
}
