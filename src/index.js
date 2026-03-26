#!/usr/bin/env node

/**
 * create-ai-workspace-template
 * Run: npm create ai-workspace-template [project-directory]
 * or:  npx create-ai-workspace-template [project-directory]
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const SKIP_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  '.next',
]);

function resolveTemplateRoot() {
  const bundled = path.join(repoRoot, 'resource');
  if (fs.existsSync(bundled)) return bundled;
  return path.join(repoRoot, 'project-resource', 'template');
}

function copyTemplateDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyTemplateDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];
  const isCurrentDir = !projectName || projectName === '.';

  const dest = isCurrentDir ? process.cwd() : path.resolve(process.cwd(), projectName);

  console.log('');
  console.log('  create-ai-workspace-template');
  console.log('  AI 에이전트 워크플로우 보일러플레이트를 세팅합니다.');
  console.log('');

  if (!isCurrentDir && fs.existsSync(dest)) {
    console.error(`  오류: 디렉터리가 이미 존재합니다: ${dest}`);
    process.exit(1);
  }

  const templateRoot = resolveTemplateRoot();
  if (!fs.existsSync(templateRoot)) {
    console.error('  오류: 템플릿 경로를 찾을 수 없습니다:', templateRoot);
    process.exit(1);
  }

  try {
    copyTemplateDir(templateRoot, dest);
  } catch (err) {
    console.error('  템플릿 복사 실패:', err.message);
    process.exit(1);
  }

  console.log('');
  console.log('  의존성 설치 중 (pnpm install)...');
  console.log('');

  const install = spawn('pnpm', ['install'], {
    cwd: dest,
    stdio: 'inherit',
    shell: true,
  });

  install.on('close', (code) => {
    if (code !== 0) {
      console.error('  pnpm install이 실패했습니다. 수동으로 실행해 주세요: pnpm install');
      process.exit(code);
    }
    console.log('');
    console.log('  완료.');
    console.log('');
    if (!isCurrentDir) {
      console.log('  다음 명령으로 시작하세요:');
      console.log(`    cd ${projectName}`);
    }
    console.log('  빠른 시작: docs/runbook/runbook.md 참고');
    console.log('    pnpm --filter web dev');
    console.log('');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
