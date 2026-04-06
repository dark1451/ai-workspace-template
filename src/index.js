#!/usr/bin/env node

/**
 * create-ai-workspace-template
 * Run: npm create ai-workspace-template [project-directory]
 * or:  npx create-ai-workspace-template [project-directory]
 */

import { spawn, execSync } from 'node:child_process';
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

function parseArgs(argv) {
  return argv.filter((a) => a && !a.startsWith('-'))[0];
}

function hasPnpmOnPath() {
  try {
    execSync('pnpm --version', { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

function runDependencyInstall(cwd, onDone) {
  const useNpx = !hasPnpmOnPath();
  if (useNpx) {
    console.log('  (PATH에 pnpm 없음 → npx pnpm으로 설치)');
    console.log('');
  } else {
    console.log('  (pnpm install)');
    console.log('');
  }

  const cmd = useNpx ? 'npx' : 'pnpm';
  const args = useNpx ? ['--yes', 'pnpm@latest', 'install'] : ['install'];

  const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });

  child.on('error', (err) => {
    console.error('  설치 실행 실패:', err.message);
    console.error('  수동: cd 프로젝트 && pnpm install 또는 npx pnpm@latest install');
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error('  설치 실패 (exit ' + code + '). 수동으로 pnpm install 시도.');
      process.exit(code ?? 1);
    }
    onDone();
  });
}

async function main() {
  const projectName = parseArgs(process.argv.slice(2));
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
    console.error('  오류: 템플릿(resource) 없음:', templateRoot);
    process.exit(1);
  }

  try {
    copyTemplateDir(templateRoot, dest);
  } catch (err) {
    console.error('  복사 실패:', err.message);
    process.exit(1);
  }

  console.log('');
  console.log('  의존성 설치 중...');
  runDependencyInstall(dest, () => {
    console.log('');
    console.log('  완료.');
    console.log('');
    if (!isCurrentDir) {
      console.log('  다음: cd ' + projectName);
    }
    console.log('  개발: pnpm --filter web dev');
    console.log('');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
