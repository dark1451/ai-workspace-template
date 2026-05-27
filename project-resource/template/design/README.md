# design/ — 화면·디자인 시스템 산출물

디자이너 에이전트가 작성하는 **구현 handoff** 저장소입니다.

## 계층

```
§5 (사용자 말 — 무드·밝기·레퍼런스)
       ↓
design/visual-direction.md   ← 디자이너가 **이 프로젝트용 레시피**를 **직접** 작성
       ↓
design/feat-xxx.md           ← 화면별 와이어·컴포넌트·인터랙션
       ↓
apps/web
```

## 무엇을 만드는가

| 파일 | 용도 |
|------|------|
| `design/visual-direction.md` | **프로젝트 전용** 시각 레시피 (팔레트·배경·마스코트·피할 것) — `_template-visual-direction.md` 참고 |
| `design/<task-id>.md` | 태스크 화면 설계서 (개발자 필수 참조) |
| `design/system.md` | (선택) 공통 토큰 — 여러 태스크에서 링크 |

## 품질 기준 (얇은 가이드 방지)

**부족한 예** — 개발자가 색만 입히고 끝나는 경우:

- "파란 톤, Pretendard, +1잔 버튼 크게"
- §5 문장만 복붙, `visual-direction.md` 없음
- **흰 카드 + 회색 라벨 + flat 버튼** (백오피스/관리자 UI)

**충분한 예**:

- **`visual-direction.md`** — 이 앱만의 무드·팔레트·배경·마스코트·피할 것
- **화면 handoff** — 와이어프레임, 위계, 상태, 인터랙션, 토큰 매핑, §7 분위기·일러스트

작성 절차: `.cursor/skills/create-screen-design-spec/SKILL.md`  
템플릿: `_template-visual-direction.md`, `_template-screen-spec.md`  
소비자 UI 패턴: `examples/consumer-ui-visual-pattern.md`

## 워크플로

1. 기획: UI feature → **design-xxx** 태스크 선행
2. 디자이너: **`visual-direction.md` 작성** → `design/<id>.md` → 개발 handoff
3. 개발자: `visual-direction.md` + `design/feat-xxx.md` 읽고 구현
