/**
 * test:scenario
 *
 * project-resource/template/ 을 test/scenarios/sandbox/ 에 임시 대화용 샌드박스로 만든다.
 *
 * 기본 동작:
 *   - sandbox 가 없으면 새로 만들고, 이미 있으면 그대로 유지한 채 진입한다 (대화 이어가기).
 *   - 리셋이 필요하면 --clean 을 명시한다.
 *
 * 모드 (둘 중 하나):
 *   기본       : sandbox 준비 후 cursor-agent 인터랙티브 세션 (CLI)
 *   --open     : sandbox 준비 후 Cursor 데스크톱 새 창으로 열기
 *
 * 기타:
 *   --clean    : 실행 시 기존 sandbox 를 통째로 삭제하고 템플릿에서 다시 복사
 *   --no-meta  : --clean 으로 새로 만들 때 .scenario-meta.json 을 만들지 않는다
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
const wantClean = flags.has('--clean');
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

function ensureSandbox() {
  if (!fs.existsSync(templateRoot)) {
    fail(`템플릿 경로가 없습니다: ${templateRoot}`);
  }

  const existed = fs.existsSync(sandboxRoot);

  if (existed && wantClean) {
    log('--clean: 기존 샌드박스 삭제:', path.relative(repoRoot, sandboxRoot));
    try {
      fs.rmSync(sandboxRoot, { recursive: true, force: true });
    } catch (err) {
      console.error('');
      console.error('  샌드박스를 삭제할 수 없습니다:', err.message);
      console.error('  원인 후보:');
      console.error('    - Cursor 새 창 / 다른 에디터가 sandbox 폴더를 열고 있음');
      console.error('    - 그 안에서 cursor-agent / 터미널 / dev server 가 살아 있음');
      console.error('  해당 창·프로세스를 모두 닫고 다시 시도하세요.');
      process.exit(1);
    }
  }

  const willCreate = !fs.existsSync(sandboxRoot);

  if (willCreate) {
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
  } else {
    log('기존 샌드박스 유지(대화 이어가기):', sandboxRoot);
    log('처음부터 다시 시작하려면: pnpm test:scenario --clean');
  }
}

function openInCursorWindow() {
  if (!hasCmdOnPath('cursor')) {
    console.log('');
    console.log('  `cursor` CLI 가 PATH 에 없어 새 창을 열 수 없습니다.');
    console.log('  Cursor 설정 → "Install \'cursor\' command in PATH" 활성화 후 다시 시도하거나,');
    console.log('  수동으로 다음 경로를 Cursor 에서 열어 주세요:');
    console.log('    ' + sandboxRoot);
    console.log('');
    console.log('  CLI 로 대화하려면: pnpm test:scenario');
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
    console.log('  설치: https://cursor.com/cli');
    console.log('  수동 실행: cd "' + sandboxRoot + '" && cursor-agent');
    console.log('');
    console.log('  데스크톱 창으로 열려면: pnpm test:scenario:open');
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

function main() {
  ensureSandbox();
  if (wantOpen) {
    openInCursorWindow();
    return;
  }
  startCursorAgent();
}

main();
