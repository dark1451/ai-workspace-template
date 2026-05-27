---
name: create-screen-design-spec
description: >-
  UI·화면 태스크용 design/ 화면 설계서를 작성한다. 색·타이포만 나열하지 않고
  레이아웃·위계·컴포넌트·상태·인터랙션까지 개발자가 그대로 구현할 수 있는 수준으로 만든다.
  Use when designer picks up a UI task, writes design/<task-id>.md, or when design handoff feels too thin.
---

# 화면 설계서 작성 (create-screen-design-spec)

## 트리거

- 디자이너가 `pending` UI·화면 태스크를 픽업할 때 (**필수**)
- `design/<task-id>.md`를 새로 쓰거나, 기존 handoff가 토큰 나열뿐일 때 보강할 때
- 기획자가 "디자인 가이드만 먼저" 요청할 때

## 원칙

- **§5 프로젝트 디자인 컨셉**은 방향(무드·밝기·밀도)이지, 화면 설계서가 아니다. 태스크별로 `design/`에 **구현 가능한 화면 설계**를 별도 작성한다.
- **금지 (얇은 handoff)**: 색상 hex·폰트 크기만 나열하고 끝내기, "미니멀하게", "파란 톤" 같은 추상어로만 적기, 레이아웃·컴포넌트·상태 없이 토큰 표만 두기, **흰 카드 + 회색 보조문구 + flat 버튼만 있는 백오피스/관리자 UI**.
- **소비자 앱 톤 (비개발자·라이프스타일 제품)**: 배경·분위기·캐릭터/일러스트·깊이(그라데이션·블러·그림자)를 설계서에 **명시**한다. "파란색"만으로는 부족하다.
- **목표**: 개발자가 **추가 해석 없이** 레이아웃·위계·상태·인터랙션을 구현할 수 있는 밀도.
- **§5**는 사용자 **말로 받은 방향**이다. **카탈로그·프리셋에서 고르지 않는다.** 디자이너가 §5·스펙·앱 목적을 보고 **이 프로젝트만의** 시각 레시피를 만든다.
- 템플릿: 화면은 `design/_template-screen-spec.md` → `design/<task-id>.md`. 레시피는 `design/_template-visual-direction.md` → `design/visual-direction.md`.

## 절차

0. **프로젝트 시각 레시피 (첫 UI 태스크 전·또는 동시)**  
   - `design/visual-direction.md`가 **없으면** `design/_template-visual-direction.md`를 복사해 **새로 작성**한다.  
   - §5·스펙·AC·사용자 말만으로 **맞춤** 팔레트·배경·마스코트·피할 것을 정의한다. 다른 프로젝트 **복붙 금지**.  
   - 막히면 `design/examples/consumer-ui-visual-pattern.md`에서 **패턴**만 참고한다 (특정 앱·프리셋 선택 아님).  
   - 작성 후 `docs/project-concept.md` §5 **디자이너 시각 레시피** 행에 `design/visual-direction.md` 경로 기록.  
   - `approval_first`: 레시피 요약(무드·색 2~3줄·마스코트 유무) 사용자 확인 후 화면 설계 진행.
1. **입력 읽기**: §5, `design/visual-direction.md`, 태스크 `spec`, AC.
2. **화면·순간 정의**: 사용자가 이 화면에서 **무엇을 하려는지** 1~2문장.
3. **정보 위계**: 화면에서 **가장 먼저 눈에 들어올 것** → **두 번째** → **부가 정보** 순으로 3단계 이상 명시.
4. **레이아웃**: ASCII 와이어프레임 또는 구역 표(헤더 / 히어로 / 본문 / CTA / 푸터). 모바일 기준(360px) 필수, 필요 시 태블릿·데스크톱 보조.
5. **컴포넌트 목록**: 각 UI 블록마다
   - 이름·역할
   - **상태**: default / hover·focus / active / disabled / empty / loading / success·error (해당되는 것만)
   - 크기·터치 영역(최소 44px 등)
   - 문구·아이콘 유무
6. **핵심 인터랙션**: 탭·스크롤·확인 모달 등 **사용자 동작 → 화면 변화**를 단계별로 (예: "+1잔 탭 → 숫자 증가 + 해당 잔 아이콘 채움 + 링 12.5% 증가").
7. **시각 언어 (토큰은 여기서)**: 색·타이포·간격·radius·shadow·blur를 **역할별**로 (예: `--surface-card`, `--text-primary`). 컴포넌트·구역과 **매핑**해 적는다. **display 폰트**(제목·숫자)와 **body 폰트**를 구분해 적는다.
8. **분위기·일러스트·이미지** (소비자 facing UI는 **필수에 가깝게**):
   - **배경**: 단색/단순 그라데이션만이 아닌 — 파도·blob·bubble·하늘광 등 **레이어** (SVG/CSS 가능, 외부 PNG/WebP 경로 명시 가능)
   - **히어로 일러스트**: mascott·제품 일러스트·empty state 그림 — 위치·크기·진행/상태에 따른 **표정·채움 변화**
   - **카드 처리**: flat white box 대신 **glassmorphism**(blur + 반투명 + border) 또는 soft shadow depth
   - **CTA**: gradient + icon + 미세 shine/ripple (과하지 않게)
   - 에셋 출처: `public/` 경로, inline SVG, CDN — 개발자가 그대로 넣을 수 있게
9. **아이콘·UI 그래픽**: 스타일(라인/솔리드/3D), empty·filled, 그리드·링 등 **데이터 시각화** 형태
10. **모션**: §5·컨셉과 모순 없는 범위에서 **짧은** 전환(200~400ms), mascot bounce·celebration·bubble float 등 **1~2개 포인트** 명시
11. **접근성**: 대비, `aria-label`/`role` 힌트, 포커스 링, `prefers-reduced-motion`
12. **개발 handoff 체크리스트**: 구현 필수 항목을 AC와 1:1로 bullet.
13. **반영 요약**: 문서 맨 위 **"프로젝트 디자인 컨셉 반영 요약"** 1~3줄.

## 완료 전 자가 점검

아래 **전부** 만족해야 `design` handoff 완료로 본다.

- [ ] 레이아웃 구역이 와이어프레임 또는 표로 그려져 있다
- [ ] CTA·주요 숫자·진행 표시의 **시각적 위계**가 문장으로 설명되어 있다
- [ ] 컴포넌트가 **2개 이상**이고, 주요 컴포넌트에 **상태**가 적혀 있다
- [ ] **인터랙션 1개 이상**이 "동작 → 피드백" 형식으로 적혀 있다
- [ ] 토큰(색·타이포)이 **구역/컴포넌트에 연결**되어 있다 (고립된 팔레트 표만 있지 않음)
- [ ] **배경·분위기 레이어** 또는 **히어로 일러스트/마스코트**가 설계되어 있다 (소비자 앱·비개발자 대상 UI)
- [ ] flat 백오피스형(흰 박스+회색 텍스트만)이 **아님** — depth·glass·gradient 중 1개 이상 명시
- [ ] `design/visual-direction.md` 존재, 화면 handoff가 레시피와 **일치**하거나 차이 **이유** 기록
- [ ] `design/<task-id>.md` 경로가 태스크 frontmatter `design` 필드에 기록되어 있다
- [ ] 개발 handoff 체크리스트가 스펙 AC를 커버한다

하나라도 빠지면 보완한 뒤 리뷰·handoff한다.

## 상태 전이

- `type: feature` UI 태스크: 자가 점검 + 동료 리뷰 pass 후 `design` 경로 기록 → status **`pending`** (개발자 픽업 대기).
- `approval_first`: handoff 전 사용자에게 **와이어프레임 요약 + 핵심 컴포넌트·CTA** 3~5줄로 확인.

## 연계

- 규칙: `.cursor/rules/design.mdc`
- 픽업: `task-pickup` 스킬
- 기획: UI 기능은 **디자인 태스크 선행** (`planning.mdc` 태스크 분해)
- 참고 패턴: `design/examples/consumer-ui-visual-pattern.md`
