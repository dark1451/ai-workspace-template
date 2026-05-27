# 소비자 앱 시각 패턴 (참고)

디자이너 handoff·개발 구현 시 **백오피스/관리자 UI**를 피하고 **라이프스타일·웰니스·일반 사용자 앱** 톤을 내기 위한 체크리스트.

> 이 문서는 **패턴 가이드**이지, 특정 프로젝트·샌드박스 구현을 가리키지 않는다.  
> 각 프로젝트는 §5·스펙·`design/visual-direction.md`에 맞춰 **새로** 설계한다.

## 피해야 할 것 (백오피스 느낌)

- `#ffffff` 카드 + `#64748b` 보조문구 + flat 단색 버튼만
- system-ui 단일 폰트, 숫자·제목 위계 없음
- 장식·배경·일러스트 전무
- 테이블/폼 같은 정렬만 있는 화면
- design handoff가 **색 hex·폰트 크기 표**만 있고 레이아웃·상태·인터랙션이 없는 경우

## 권장 패턴

| 영역 | 패턴 | 구현 힌트 |
|------|------|-----------|
| **배경** | immersive gradient + 2~3 레이어 | CSS gradient, 하단 실루엣 SVG, subtle grain/noise |
| **카드** | glassmorphism 또는 soft depth | `rgba` + `backdrop-filter: blur()` + warm border/shadow |
| **타이포** | display + body 분리 | serif/display(제목·숫자) + sans(body·버튼) |
| **히어로** | mascot 또는 핵심 일러스트 + 데이터 | 상태별 표정·채움, progress ring/strip |
| **CTA** | gradient + icon + depth | 2-stop gradient, min-height ≥ 48px, focus ring |
| **피드백** | inline celebration | toast/banner + mascot bounce, 200~400ms |
| **모션** | 포인트 2~3개 | `prefers-reduced-motion` 대응 필수 |

## 에셋 전략

1. **inline SVG** — mascot, 아이콘, 배경 실루엣 (선명·번들 유리)
2. **public/** — PNG/WebP (복잡한 일러스트)
3. **CSS only** — gradient, blur, pseudo-elements (가벼운 분위기)

디자인 설계서(`design/<task-id>.md`) §7에 위 항목을 **구체적으로** 적어 개발자가 그대로 옮길 수 있게 한다.

## 디자이너·개발자 연계

| 역할 | 확인 |
|------|------|
| **디자이너** | `visual-direction.md` + 화면 handoff에 배경·마스코트·토큰 매핑·AC 체크리스트 |
| **개발자** | handoff §7을 코드로 옮김 — AppShell/배경 레이어, display·body 폰트, glass/gradient CTA |
| **공통** | flat white box만으로 UI를 끝내지 않음 |

작성·구현 절차: `.cursor/skills/create-screen-design-spec/SKILL.md`, `design/_template-screen-spec.md`
