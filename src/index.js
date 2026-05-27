#!/usr/bin/env node

/**
 * create-ai-workspace-template
 * Run: npm create ai-workspace-template [project-directory]
 *      npx create-ai-workspace-template upgrade [project-directory] [--dry-run]
 */

import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {
  copyTemplateDir,
  readPackageVersion,
  resolveTemplateRoot,
  writeProjectManifest,
} from './shared.js';
import { runUpgrade } from './upgrade.js';

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] === 'upgrade' ? 'upgrade' : 'create';
  const rest = command === 'upgrade' ? args.slice(1) : args;
  const projectName = rest.filter((a) => a && !a.startsWith('-'))[0];
  return { command, projectName, upgradeArgv: rest };
}

function canUsePnpm() {
  const probe = process.platform === 'win32' ? 'where pnpm' : 'command -v pnpm';
  try {
    execSync(probe, { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

function runDependencyInstall(cwd, onDone) {
  const usePnpm = canUsePnpm();
  if (usePnpm) {
    console.log('  (pnpm install)');
  } else {
    console.log('  (pnpm 없음 → npm install)');
  }
  console.log('');

  const cmd = usePnpm ? 'pnpm' : 'npm';
  const args = ['install'];

  const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });

  child.on('error', (err) => {
    console.error('  설치 실행 실패:', err.message);
    console.error('  수동: cd 프로젝트 && pnpm install 또는 npm install');
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

async function runCreate(projectName) {
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
    writeProjectManifest(dest, readPackageVersion());
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
    console.log('  업그레이드: npx create-ai-workspace-template upgrade');
    console.log('');
  });
}

async function main() {
  const { command, projectName, upgradeArgv } = parseArgs(process.argv);

  if (command === 'upgrade') {
    await runUpgrade(upgradeArgv);
    return;
  }

  await runCreate(projectName);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
