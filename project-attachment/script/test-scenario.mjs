/**
 * test:scenario
 *
 * project-resource/template/ 을 test/scenarios/sandbox/ 에 통째로 복사해
 * "임시 대화용 샌드박스"를 만든다. 기존 sandbox가 있으면 항상 리셋한다.
 *
 * 옵션:
 *   --open    : 복사 후 Cursor 새 창으로 sandbox 폴더를 연다 (cursor CLI 필요)
 *   --agent   : 복사 후 sandbox 폴더에서 cursor-agent 를 인터랙티브로 띄운다
 *   --no-meta : .scenario-meta.json 을 만들지 않는다
 *
 * 옵션 없이 실행하면 경로만 출력하고 다음 액션을 안내한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const templateRoot = path.join(repoRoot, 'project-resource', 'template');
const sandboxRoot = path.join(repoRoot, 'test', 'scenarios', 'sandbox');

const SKIP_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  '.next',
  '.scenario-meta.json',
]);

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const wantOpen = flags.has('--open');
const wantAgent = flags.has('--agent');
const wantMeta = !flags.has('--no-meta');

function log(...m) {
  console.log('[test:scenario]', ...m);
}

function fail(msg) {
  console.error('[test:scenario] ' + msg);
  process.exit(1);
}

function copyTemplate(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyTemplate(from, to);
    else fs.copyFileSync(from, to);
  }
}

function readGitHead() {
  try {
    return execSync('git rev-parse HEAD', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function hasCmdOnPath(cmd) {
  try {
    const probe = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
    execSync(probe, { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

function resetSandbox() {
  if (!fs.existsSync(templateRoot)) {
    fail(`템플릿 경로가 없습니다: ${templateRoot}`);
  }

  if (fs.existsSync(sandboxRoot)) {
    log('기존 샌드박스 삭제:', path.relative(repoRoot, sandboxRoot));
    fs.rmSync(sandboxRoot, { recursive: true, force: true });
  }

  log('템플릿 복사 중...');
  copyTemplate(templateRoot, sandboxRoot);

  if (wantMeta) {
    const meta = {
      createdAt: new Date().toISOString(),
      sourceCommit: readGitHead(),
      sourcePath: path.relative(repoRoot, templateRoot).replace(/\\/g, '/'),
      note: '이 파일은 test:scenario 가 생성한 메타데이터입니다. 자유롭게 삭제 가능.',
    };
    fs.writeFileSync(
      path.join(sandboxRoot, '.scenario-meta.json'),
      JSON.stringify(meta, null, 2) + '\n',
      'utf8'
    );
  }

  log('샌드박스 준비 완료:', sandboxRoot);
}

function openInCursorWindow() {
  if (!hasCmdOnPath('cursor')) {
    console.log('');
    console.log('  `cursor` CLI 가 PATH 에 없어 자동으로 열 수 없습니다.');
    console.log('  Cursor 설정 → "Install \'cursor\' command in PATH" 활성화 후 다시 시도하거나,');
    console.log('  수동으로 다음 경로를 Cursor 에서 열어 주세요:');
    console.log('    ' + sandboxRoot);
    return;
  }
  log('Cursor 새 창으로 엽니다...');
  const child = spawn('cursor', [sandboxRoot], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });
  child.unref();
}

function startCursorAgent() {
  if (!hasCmdOnPath('cursor-agent')) {
    console.log('');
    console.log('  `cursor-agent` CLI 가 PATH 에 없습니다.');
    console.log('  설치 가이드: https://cursor.com/cli');
    console.log('  수동으로 실행하려면:');
    console.log('    cd "' + sandboxRoot + '" && cursor-agent');
    return;
  }
  log('cursor-agent 인터랙티브 세션 시작 (Ctrl+C 로 종료)');
  const child = spawn('cursor-agent', [], {
    cwd: sandboxRoot,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => {
    log(`agent 종료 (exit ${code ?? 0})`);
  });
}

function printNextSteps() {
  console.log('');
  console.log('  다음 중 하나로 대화를 시작하세요:');
  console.log('');
  console.log('    pnpm test:scenario:open        # Cursor 새 창에서 열기');
  console.log('    pnpm test:scenario:agent       # 터미널에서 cursor-agent 시작');
  console.log('    또는 위 경로를 직접 Cursor 에서 여세요.');
  console.log('');
  console.log('  다시 실행하면 샌드박스는 항상 깨끗하게 리셋됩니다.');
  console.log('');
}

function main() {
  resetSandbox();
  if (wantOpen) {
    openInCursorWindow();
    return;
  }
  if (wantAgent) {
    startCursorAgent();
    return;
  }
  printNextSteps();
}

main();
