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
 * 역할 시나리오:
 *   --role=<key>   : agent 시작 시 첫 프롬프트로 역할 지시를 전달
 *                    key: dev | design | plan | test | pm (실제 사용 가능 키는
 *                    sandbox/.cursor/role-prompts/*.md 에 있는 파일명에서 결정됨)
 *                    예: --role=dev → ".cursor/role-prompts/dev.md" 본문 사용
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
const flags = new Set(args.filter((a) => a.startsWith('--') && !a.includes('=')));
const kv = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--') && a.includes('='))
    .map((a) => {
      const i = a.indexOf('=');
      return [a.slice(2, i), a.slice(i + 1)];
    })
);
const wantOpen = flags.has('--open');
const wantClean = flags.has('--clean');
const wantMeta = !flags.has('--no-meta');
const role = kv.role || null;

const ROLE_PROMPTS_DIR_REL = path.join('.cursor', 'role-prompts');

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

function listRolePromptKeys(rootDir) {
  const dir = path.join(rootDir, ROLE_PROMPTS_DIR_REL);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md') && d.name.toLowerCase() !== 'readme.md')
    .map((d) => d.name.replace(/\.md$/, ''))
    .sort();
}

function readRolePrompt(rootDir, key) {
  const file = path.join(rootDir, ROLE_PROMPTS_DIR_REL, `${key}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const sep = raw.indexOf('\n---\n');
  const body = sep === -1 ? raw : raw.slice(sep + '\n---\n'.length);
  return body.trim();
}

function resolveRolePrompt() {
  if (!role) return null;
  const keys = listRolePromptKeys(sandboxRoot);
  if (keys.length === 0) {
    console.error('[test:scenario] sandbox/.cursor/role-prompts/ 에 역할 프롬프트 파일이 없습니다.');
    console.error('  --clean 으로 sandbox 를 재생성하거나 template 을 확인해 주세요.');
    process.exit(1);
  }
  if (!keys.includes(role)) {
    console.error(`[test:scenario] 알 수 없는 --role 값: ${role}`);
    console.error('  사용 가능 키:', keys.join(', '));
    console.error(`  (sandbox/${ROLE_PROMPTS_DIR_REL.replace(/\\/g, '/')}/<key>.md 파일에서 결정됨)`);
    process.exit(1);
  }
  const prompt = readRolePrompt(sandboxRoot, role);
  if (!prompt) {
    console.error(`[test:scenario] 역할 프롬프트 본문을 읽지 못했습니다: ${role}`);
    process.exit(1);
  }
  return prompt;
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

function openInCursorWindow(prompt) {
  if (!hasCmdOnPath('cursor')) {
    console.log('');
    console.log('  `cursor` CLI 가 PATH 에 없어 새 창을 열 수 없습니다.');
    console.log('  Cursor 설정 → "Install \'cursor\' command in PATH" 활성화 후 다시 시도하거나,');
    console.log('  수동으로 다음 경로를 Cursor 에서 열어 주세요:');
    console.log('    ' + sandboxRoot);
    console.log('');
    console.log('  CLI 로 대화하려면: pnpm test:scenario');
    if (prompt) printInitialPrompt(prompt);
    return;
  }
  log('Cursor 새 창으로 엽니다...');
  const child = spawn('cursor', [sandboxRoot], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });
  child.unref();

  if (prompt) {
    printInitialPrompt(prompt);
    console.log('  → Cursor 새 창의 채팅 첫 메시지로 위 텍스트를 붙여넣어 주세요.');
    console.log('');
  }
}

function printInitialPrompt(prompt) {
  console.log('');
  console.log('─── 초기 프롬프트 (역할: ' + role + ') ' + '─'.repeat(20));
  console.log(prompt);
  console.log('─'.repeat(60));
  console.log(`  본문 소스: sandbox/${ROLE_PROMPTS_DIR_REL.replace(/\\/g, '/')}/${role}.md`);
  console.log('  자동 전달이 안 되면 위 텍스트를 cursor-agent 의 첫 메시지로 붙여넣어 주세요.');
  console.log('');
}

function startCursorAgent(prompt) {
  if (!hasCmdOnPath('cursor-agent')) {
    console.log('');
    console.log('  `cursor-agent` CLI 가 PATH 에 없습니다.');
    console.log('  설치: https://cursor.com/cli');
    console.log('  수동 실행: cd "' + sandboxRoot + '" && cursor-agent');
    console.log('');
    console.log('  데스크톱 창으로 열려면: pnpm test:scenario:open');
    if (prompt) printInitialPrompt(prompt);
    return;
  }

  if (prompt) {
    printInitialPrompt(prompt);
  }

  log('cursor-agent 인터랙티브 세션 시작 (Ctrl+C 로 종료)');
  const childArgs = prompt ? [prompt] : [];
  const child = spawn('cursor-agent', childArgs, {
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
  const prompt = resolveRolePrompt();
  if (wantOpen) {
    openInCursorWindow(prompt);
    return;
  }
  startCursorAgent(prompt);
}

main();
