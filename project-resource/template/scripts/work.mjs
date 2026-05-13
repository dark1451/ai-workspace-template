/**
 * work
 *
 * 사용자 프로젝트 루트에서 cursor-agent 를 띄우는 진입점.
 * `.cursor/role-prompts/<role>.md` 본문을 첫 메시지로 넣어 역할 에이전트를 시작한다.
 *
 * pnpm 스크립트 예:
 *   pnpm work               # 역할 없이 인터랙티브 세션
 *   pnpm work:dev           # 개발자 역할 (.cursor/role-prompts/dev.md)
 *   pnpm work:design        # 디자이너
 *   pnpm work:plan          # 기획자
 *   pnpm work:test          # 테스트
 *   pnpm work:pm            # PM
 *   pnpm work --open        # cursor-agent 대신 Cursor 데스크톱 새 창
 *
 * 직접:
 *   node ./scripts/work.mjs --role=dev
 *   node ./scripts/work.mjs --open --role=pm
 *
 * 통합:
 *   템플릿 저장소의 `test:scenario:<role>` 은 sandbox 안에서 같은 agent-runner.mjs 를 호출한다.
 *   본문(역할 지시 텍스트)도 동일하게 `.cursor/role-prompts/<role>.md` 한 곳에서 읽는다.
 *   편집은 그 파일을 직접 수정하면 된다.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseArgs, runAgent } from './agent-runner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const args = parseArgs(process.argv.slice(2));

await runAgent({
  rootDir,
  role: args.role,
  open: args.open,
  label: 'work',
});
