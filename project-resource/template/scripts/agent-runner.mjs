/**
 * agent-runner
 *
 * 역할 활성화된 cursor-agent / Cursor 새 창 세션을 시작하는 공통 코어.
 *
 * 두 진입점이 이 모듈을 공유한다:
 *   - 사용자 프로젝트:   scripts/work.mjs              ─ cwd = 프로젝트 루트
 *   - 템플릿 저장소:     project-attachment/script/    ─ cwd = test/scenarios/sandbox
 *                       test-scenario.mjs              (옛 sandbox 호환 fallback 포함)
 *
 * 공통 입력:
 *   --role=<key>   .cursor/role-prompts/<key>.md 본문을 첫 메시지로 전달
 *                  (없으면 일반 cursor-agent 세션)
 *   --open         cursor-agent 인터랙티브 대신 Cursor 데스크톱 새 창
 *
 * 기본:
 *   role 없이 실행하면 cursor-agent 가 빈 첫 메시지로 시작한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';

const ROLE_PROMPTS_REL = path.join('.cursor', 'role-prompts');

export function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--') && !a.includes('=')));
  const kv = Object.fromEntries(
    argv
      .filter((a) => a.startsWith('--') && a.includes('='))
      .map((a) => {
        const i = a.indexOf('=');
        return [a.slice(2, i), a.slice(i + 1)];
      })
  );
  return {
    role: kv.role || null,
    open: flags.has('--open'),
    clean: flags.has('--clean'),
    noMeta: flags.has('--no-meta'),
    flags,
    kv,
  };
}

export function listRolePromptKeys(rootDir) {
  const dir = path.join(rootDir, ROLE_PROMPTS_REL);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md') && d.name.toLowerCase() !== 'readme.md')
    .map((d) => d.name.replace(/\.md$/, ''))
    .sort();
}

export function readRolePrompt(rootDir, key) {
  const file = path.join(rootDir, ROLE_PROMPTS_REL, `${key}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const sep = raw.indexOf('\n---\n');
  const body = sep === -1 ? raw : raw.slice(sep + '\n---\n'.length);
  return body.trim() || null;
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

function logTag(label, ...m) {
  console.log(`[${label}]`, ...m);
}

function printInitialPrompt({ label, role, prompt, sourceRel }) {
  console.log('');
  console.log('─── 초기 프롬프트 (역할: ' + role + ') ' + '─'.repeat(20));
  console.log(prompt);
  console.log('─'.repeat(60));
  console.log(`  본문 소스: ${sourceRel}`);
  console.log(`  자동 전달이 안 되면 위 텍스트를 cursor-agent 의 첫 메시지로 붙여넣어 주세요.`);
  console.log('');
}

/**
 * @param {object} opts
 * @param {string} opts.rootDir         cursor-agent / cursor 가 띄울 cwd
 * @param {string|null} opts.role       역할 키 (dev/design/plan/test/pm 또는 사용자 정의)
 * @param {boolean} opts.open           true 면 Cursor 새 창, false 면 cursor-agent CLI
 * @param {string} [opts.label]         로그 prefix (예: "work", "test:scenario")
 */
export async function runAgent({ rootDir, role, open = false, label = 'agent-runner' }) {
  if (!fs.existsSync(rootDir)) {
    console.error(`[${label}] 작업 디렉터리가 없습니다: ${rootDir}`);
    process.exit(1);
  }

  let prompt = null;
  let sourceRel = null;
  if (role) {
    const keys = listRolePromptKeys(rootDir);
    if (keys.length === 0) {
      console.error(`[${label}] ${ROLE_PROMPTS_REL.replace(/\\/g, '/')}/ 에 역할 프롬프트 파일이 없습니다.`);
      console.error('  템플릿이 정상 복사됐는지 확인하거나 (--clean 필요), 직접 파일을 만들어 주세요.');
      process.exit(1);
    }
    if (!keys.includes(role)) {
      console.error(`[${label}] 알 수 없는 --role 값: ${role}`);
      console.error('  사용 가능 키:', keys.join(', '));
      console.error(`  (${ROLE_PROMPTS_REL.replace(/\\/g, '/')}/<key>.md 파일에서 결정됨)`);
      process.exit(1);
    }
    prompt = readRolePrompt(rootDir, role);
    if (!prompt) {
      console.error(`[${label}] 역할 프롬프트 본문을 읽지 못했습니다: ${role}`);
      process.exit(1);
    }
    sourceRel = `${ROLE_PROMPTS_REL.replace(/\\/g, '/')}/${role}.md`;
  }

  if (open) {
    if (!hasCmdOnPath('cursor')) {
      console.log('');
      console.log('  `cursor` CLI 가 PATH 에 없어 새 창을 열 수 없습니다.');
      console.log('  Cursor 설정 → "Install \'cursor\' command in PATH" 활성화 후 다시 시도하거나,');
      console.log('  수동으로 다음 경로를 Cursor 에서 열어 주세요:');
      console.log('    ' + rootDir);
      console.log('');
      console.log(`  CLI 로 대화하려면: 같은 명령에서 --open 을 빼고 실행`);
      if (prompt) printInitialPrompt({ label, role, prompt, sourceRel });
      return;
    }
    logTag(label, 'Cursor 새 창으로 엽니다...');
    const child = spawn('cursor', [rootDir], {
      stdio: 'ignore',
      shell: true,
      detached: true,
    });
    child.unref();
    if (prompt) {
      printInitialPrompt({ label, role, prompt, sourceRel });
      console.log('  → Cursor 새 창의 채팅 첫 메시지로 위 텍스트를 붙여넣어 주세요.');
      console.log('');
    }
    return;
  }

  if (!hasCmdOnPath('cursor-agent')) {
    console.log('');
    console.log('  `cursor-agent` CLI 가 PATH 에 없습니다.');
    console.log('  설치: https://cursor.com/cli');
    console.log(`  수동 실행: cd "${rootDir}" && cursor-agent`);
    console.log('');
    console.log('  데스크톱 창으로 열려면: 같은 명령에 --open 을 추가');
    if (prompt) printInitialPrompt({ label, role, prompt, sourceRel });
    return;
  }

  if (prompt) {
    printInitialPrompt({ label, role, prompt, sourceRel });
  }

  logTag(label, `cursor-agent 인터랙티브 세션 시작 (Ctrl+C 로 종료, cwd: ${rootDir})`);
  const childArgs = prompt ? [prompt] : [];
  const child = spawn('cursor-agent', childArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });
  await new Promise((resolve) => {
    child.on('exit', (code) => {
      logTag(label, `agent 종료 (exit ${code ?? 0})`);
      resolve();
    });
  });
}
