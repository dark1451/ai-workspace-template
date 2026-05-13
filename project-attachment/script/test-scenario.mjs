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
 *
 * 통합:
 *   sandbox 안의 `scripts/agent-runner.mjs` 가 있으면 그 모듈을 동적 import 해서
 *   사용자 프로젝트의 `pnpm work:<role>` 과 동일한 코드 경로로 실행한다.
 *   (없는 옛 sandbox 는 내장 fallback 으로 동작 — 새로 만들고 싶으면 --clean)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
const AGENT_RUNNER_REL = path.join('scripts', 'agent-runner.mjs');

const LABEL = 'test:scenario';

function log(...m) {
  console.log(`[${LABEL}]`, ...m);
}

function fail(msg) {
  console.error(`[${LABEL}] ${msg}`);
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

/* ─────────────────────────────────────────────────────────────────────
 *  Fallback (옛 sandbox 에 scripts/agent-runner.mjs 가 없는 경우)
 *  최신 sandbox 는 runAgent 동적 import 경로로 실행된다.
 * ───────────────────────────────────────────────────────────────────── */

function listRolePromptKeysFallback(rootDir) {
  const dir = path.join(rootDir, ROLE_PROMPTS_DIR_REL);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md') && d.name.toLowerCase() !== 'readme.md')
    .map((d) => d.name.replace(/\.md$/, ''))
    .sort();
}

function readRolePromptFallback(rootDir, key) {
  const file = path.join(rootDir, ROLE_PROMPTS_DIR_REL, `${key}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const sep = raw.indexOf('\n---\n');
  const body = sep === -1 ? raw : raw.slice(sep + '\n---\n'.length);
  return body.trim();
}

function resolveRolePromptFallback() {
  if (!role) return null;
  const keys = listRolePromptKeysFallback(sandboxRoot);
  if (keys.length === 0) {
    fail('sandbox/.cursor/role-prompts/ 에 역할 프롬프트 파일이 없습니다. --clean 후 재시도하세요.');
  }
  if (!keys.includes(role)) {
    console.error(`[${LABEL}] 알 수 없는 --role 값: ${role}`);
    console.error('  사용 가능 키:', keys.join(', '));
    process.exit(1);
  }
  const prompt = readRolePromptFallback(sandboxRoot, role);
  if (!prompt) fail(`역할 프롬프트 본문을 읽지 못했습니다: ${role}`);
  return prompt;
}

function printInitialPromptFallback(prompt) {
  console.log('');
  console.log('─── 초기 프롬프트 (역할: ' + role + ') ' + '─'.repeat(20));
  console.log(prompt);
  console.log('─'.repeat(60));
  console.log(`  본문 소스: sandbox/${ROLE_PROMPTS_DIR_REL.replace(/\\/g, '/')}/${role}.md`);
  console.log('  자동 전달이 안 되면 위 텍스트를 cursor-agent 의 첫 메시지로 붙여넣어 주세요.');
  console.log('');
}

function runFallback() {
  const prompt = resolveRolePromptFallback();

  if (wantOpen) {
    if (!hasCmdOnPath('cursor')) {
      console.log('  `cursor` CLI 가 PATH 에 없어 새 창을 열 수 없습니다.');
      console.log('  수동으로 다음 경로를 Cursor 에서 열어 주세요:', sandboxRoot);
      if (prompt) printInitialPromptFallback(prompt);
      return;
    }
    log('Cursor 새 창으로 엽니다...');
    const child = spawn('cursor', [sandboxRoot], { stdio: 'ignore', shell: true, detached: true });
    child.unref();
    if (prompt) {
      printInitialPromptFallback(prompt);
      console.log('  → Cursor 새 창의 채팅 첫 메시지로 위 텍스트를 붙여넣어 주세요.\n');
    }
    return;
  }

  if (!hasCmdOnPath('cursor-agent')) {
    console.log('  `cursor-agent` CLI 가 PATH 에 없습니다. 설치: https://cursor.com/cli');
    console.log(`  수동 실행: cd "${sandboxRoot}" && cursor-agent`);
    if (prompt) printInitialPromptFallback(prompt);
    return;
  }
  if (prompt) printInitialPromptFallback(prompt);

  log('cursor-agent 인터랙티브 세션 시작 (Ctrl+C 로 종료)');
  const childArgs = prompt ? [prompt] : [];
  const child = spawn('cursor-agent', childArgs, {
    cwd: sandboxRoot,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => log(`agent 종료 (exit ${code ?? 0})`));
}

/* ─────────────────────────────────────────────────────────────────────
 *  메인: sandbox 안의 agent-runner.mjs 를 동적 import 하여 실행
 * ───────────────────────────────────────────────────────────────────── */

async function main() {
  ensureSandbox();

  const runnerPath = path.join(sandboxRoot, AGENT_RUNNER_REL);
  if (!fs.existsSync(runnerPath)) {
    log(`옛 sandbox 감지 (${AGENT_RUNNER_REL} 없음) → 내장 fallback 사용`);
    log('통합 코드 경로로 실행하려면: pnpm test:scenario --clean');
    runFallback();
    return;
  }

  const { runAgent } = await import(pathToFileURL(runnerPath).href);
  await runAgent({
    rootDir: sandboxRoot,
    role,
    open: wantOpen,
    label: LABEL,
  });
}

main().catch((err) => {
  console.error(`[${LABEL}] 예기치 않은 오류:`, err);
  process.exit(1);
});
