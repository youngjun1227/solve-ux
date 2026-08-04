# SETUP.md — 기술 세팅 가이드

**대상: 팀장 (세팅 담당자)**
이 문서는 저장소·AI 도우미·자동 검사를 세팅하는 방법입니다. 팀원1~3은 읽지 않아도 됩니다.
프로젝트 전체 내용은 `PROJECT_PLAN.md`를 보세요.

**세팅 완료 목표: 2026년 8월 7일(금)**

---

## 1. 세팅 순서

우선순위대로입니다. 1~4까지만 되면 팀원들이 8/7부터 합류할 수 있습니다.

1. 저장소 + 폴더 구조 + `.gitignore`
2. `CLAUDE.md` (프로젝트 헌법)
3. `/start`, `/save` 커맨드 + 위험 명령어 차단
4. `evidence-card` Skill
5. 나머지 Skill 6개
6. Sub-agent 7개
7. `traceability-check` 스크립트

---

## 2. 저장소 초기화

### 폴더 구조

```bash
mkdir -p solve-ux/{00_project,01_evidence/{team,desk/sources,screen,competitor,screens},02_hypothesis/draft,03_validation/{design,raw,anonymized,analysis},04_painpoint,05_solution,06_prototype,07_usertest/{protocol,raw,anonymized,analysis},08_deliverable,_meta,.claude/{agents,skills,commands}}
```

각 폴더에 `.gitkeep`을 넣어 빈 폴더도 커밋되게 합니다.

### `.gitignore`

```gitignore
# 개인정보 — 절대 커밋 금지
03_validation/raw/
07_usertest/raw/
**/contacts*
**/연락처*
*.mp4
*.mov
*.m4a

# 자동 생성물 (충돌 방지)
01_evidence/index.csv
_meta/traceability.md

# 개발
node_modules/
dist/
.env
.DS_Store
```

### 브랜치 정책

**main 하나만 사용합니다.** 브랜치를 쓰지 않습니다.
6절의 소유권 분리 덕분에 충돌이 구조적으로 안 나므로 브랜치의 이득이 거의 없고, 비개발자 팀원이 가장 많이 깨뜨리는 지점입니다.

### 커밋 메시지 규칙

```
[유형] 요약 — ID범위 (이름)
```

예시:
```
[E] 20대 보험 인식 데스크리서치 — E-401~E-408 (팀원3)
[S] 보험 Tab 메인/상세 화면 분석 — S-104~S-109 (팀원1)
[H] 가설 초안 7건 생성 (팀장)
[DOC] 설문 문항 v2 (팀원3)
```

유형: `E` `S` `C` `O` `H` `P` `SOL` `DOC` `SETUP` `FIX`

`git log --oneline`이 그대로 진행 상황판이 됩니다. **별도 워크로그 파일은 만들지 마세요.** 그 자체가 충돌 유발자입니다.

---

## 3. `CLAUDE.md` (프로젝트 헌법)

저장소 루트에 둡니다. 모든 세션에서 항상 로드되므로, **조건부가 아니라 무조건 지켜야 할 것만** 넣습니다.

```markdown
# SOL:VE 프로젝트 규칙

## 프로젝트
신한 SuperSOL 보험 Tab UX 개선. 2026-08-05 ~ 2026-09-20.
전체 계획은 00_project/PROJECT_PLAN.md 참조.

## 절대 규칙 (Research Rule)

1. AI가 발견한 UX 문제를 사용자 Pain Point로 단정하지 않는다.
   반드시 "~할 가능성이 있다" 형태로 표현한다.
2. 팀이 발견한 문제도 사용자 검증 전에는 Problem Hypothesis다.
3. 사실(Fact) / 외부 Research / 팀 Observation / AI Inference를 반드시 구분 표기한다.
4. 외부 자료는 원출처를 사용하고 발행기관·발행일·URL·페이지를 기록한다.
5. 근거 없는 내용을 사실처럼 생성하지 않는다. 모르면 "확인되지 않음"이라 쓴다.
6. 경쟁사 기능 주장은 근거 등급(A~D)을 표기한다. D등급은 카드를 만들지 않는다.
7. 화면 분석 시 [화면에서 확인되는 사실]과 [UX 해석]을 분리한다.
8. 여러 Evidence가 같은 문제를 가리키면 서로 연결해 보여준다.
9. 사용자 조사 결과와 AI 예상이 다르면 무조건 사용자 조사가 우선한다.
10. UX 개선안은 Validated Pain Point에 연결되어야 한다.
11. AI가 예상한 개선 효과는 가설일 뿐이다. 효과 판단은 실제 테스트 결과로만 한다.
12. Evidence → Hypothesis → Validation → Solution → Validation 추적성을 유지한다.

## ID 규칙

- O-### 팀 관찰 / E-### 데스크 / S-### 화면 / C-### 경쟁사
- H-### 가설 / P-### 검증된 Pain Point / SOL-### 개선안 / M-### 측정결과
- ID 대역(카드 종류 무관, 사람당 하나): 팀장 100번대 / 팀원1 200번대 /
  팀원2 300번대 / 팀원3 400번대
  → O·E·S·C·SOL에 적용한다. (예: 팀원3 → O-401, E-402, S-403, C-404, SOL-405)
  → H·P·M은 대역이 없다. 001부터 순번으로 발급하며 회의에서만 생성된다.
    따라서 H·P·M은 대역 위반 검사(traceability_check #9)의 대상이 아니다.
- 카드는 절대 삭제하지 않는다. status 변경만 허용한다.
- H 카드 초안은 02_hypothesis/draft/에, 팀이 확정한 H 카드는 02_hypothesis/에 둔다.
  draft/의 초안은 8/17 종합 회의에서 확정된 것만 02_hypothesis/로 승격된다.
- P 카드는 04_painpoint/에만 존재하며 Gate 1 통과 시에만 새로 생성된다.
- M 카드는 Gate 2 통과 시에만 새로 생성된다.

## 카드 필수 필드

모든 카드는 YAML front-matter로 시작한다.
- 공통: id, type, author, date
- E 카드: source_org, published, url 또는 local_file, page, grade
- C 카드: app, user_task, grade, capture (파일 경로)
- S 카드: screen (캡처 경로)
- H 카드: status, evidence[], source_types[], validated_by
  → source_types는 서로 다른 종류가 최소 2개여야 한다
- SOL 카드: pain_point (P-### 필수)

## 금지 표현

다음 표현을 검증 전 단계에서 쓰지 않는다.
"사용자는 ~를 불편해한다" / "~가 문제다" / "명백히" / "확실히"
→ "~할 가능성이 있다" / "~로 보인다" / "가설: ~"

## 파일 소유권 — 폴더가 아니라 ID 대역

- 소유 단위는 폴더가 아니라 ID 대역이다. 폴더는 분류일 뿐 소유물이 아니다.
- 각자 자기 대역(위 "ID 규칙" 참조) 번호의 카드만 생성·수정한다.
  남의 대역 카드는 수정하지 않는다.
- 여러 명이 같은 폴더에 카드를 만드는 것은 정상이며 위반이 아니다.
  01_evidence/team/(전원) · 01_evidence/desk/(팀장·팀원2·팀원3) · 05_solution/(팀장·팀원2)
- 번호가 없는 공용 파일(_meta/decision_log.md, 08_deliverable/outline.md 등)은
  팀 회의 중에만 수정한다.

## 개인정보

03_validation/raw/, 07_usertest/raw/, 연락처 관련 파일은 절대 커밋하지 않는다.
분석은 익명화된 anonymized/ 폴더의 파일로만 수행한다.
```

---

## 4. 커맨드 (`.claude/commands/`)

### `.claude/commands/start.md`

```markdown
---
description: 작업 시작 — 최신 자료 받아오고 변경사항 요약
---

1. `git pull --rebase` 실행
2. 충돌이 있으면 해결하지 말고, 어떤 파일이 충돌했는지 한국어로 설명하고 멈춘다
3. `git log --oneline -20`으로 최근 커밋 확인
4. 다음을 한국어로 3~5줄 요약한다:
   - 마지막 접속 이후 팀원들이 추가한 카드와 ID
   - 새로 생긴 결정사항 (_meta/decision_log.md 변경분)
   - 이번 주 일정상 오늘 해야 할 일 (00_project/PROJECT_PLAN.md 4-2절 참조)
5. 전문 용어를 쓰지 말고 설명한다.
```

### `.claude/commands/save.md`

```markdown
---
description: 작업 저장 — 팀 저장소에 올리기
---

1. `git status`로 변경 파일 확인
2. .gitignore 대상(raw/, 연락처, 영상)이 포함됐으면 즉시 중단하고 경고한다
3. `git pull --rebase` 실행. 충돌 시 해결하지 말고 한국어로 설명 후 중단
4. `git add` 후, 변경 내용을 보고 커밋 메시지를 규칙대로 생성한다:
   [유형] 요약 — ID범위 (이름)
5. 커밋 메시지를 사용자에게 보여주고 확인받는다
6. `git push`
7. 실패하면 원인을 한국어로 쉽게 설명하고, 해결책을 제시하되
   위험한 명령(force, reset --hard)은 절대 제안하지 않는다
```

### `.claude/commands/audit.md`

```markdown
---
description: 추적성 검사 — 근거가 끊긴 곳 찾기
---

1. python3 scripts/traceability_check.py 실행
2. red-team-auditor sub-agent 호출
3. 결과를 _meta/traceability.md에 저장
4. 발견된 문제를 심각도순으로 한국어 요약
```

### `.claude/commands/evidence.md`

```markdown
---
description: 리서치 실행 — /evidence <주제>
---

1. 주제에 맞는 sub-agent 선택 (desk-researcher / competitor-analyst / screen-analyst)
2. 해당 agent 실행
3. 생성된 카드 ID 목록과 3줄 요약만 보고
4. index.csv 재생성 스크립트 실행
```

### `.claude/settings.json` — 위험 명령어 차단

```json
{
  "permissions": {
    "deny": [
      "Bash(git push --force*)",
      "Bash(git push -f*)",
      "Bash(git reset --hard*)",
      "Bash(git rebase -i*)",
      "Bash(git clean -fd*)",
      "Bash(git checkout -- *)",
      "Bash(rm -rf*)"
    ]
  }
}
```

---

## 5. Skill (`.claude/skills/`)

### 5-1. `evidence-card` — 최우선

카드 포맷, ID 발급 규칙, index.csv 재생성 스크립트를 담습니다. 모든 리서치 agent가 공유합니다.

**index.csv는 소스가 아니라 생성물입니다.**
4명이 동시에 같은 CSV 끝에 줄을 추가하면 100% 충돌합니다. `.gitignore`에 넣고, 카드의 front-matter를 스캔해 매번 재생성하는 스크립트로 대체하세요.

```python
# scripts/build_index.py
# 01_evidence/**/*.md 의 front-matter를 파싱해 index.csv 생성
# 컬럼: id, type, author, date, source_org, grade, file_path, summary
```

ID 발급 규칙: 각자 자기 대역 안에서 마지막 번호 +1. `ls` 후 최대값을 확인하고 발급합니다. 대역이 분리돼 있어 동시 발급 충돌이 없습니다.

### 5-2. `screen-analysis-framework`

`project_flow.md` 1-C의 12개 관점을 체크리스트로 만듭니다.
Information Architecture / User Flow / Navigation / Discoverability / Information Hierarchy / Cognitive Load / Terminology / CTA / Consistency / Personalization / Accessibility / 콘텐츠 구조

출력 서식은 반드시 2단 분리:
```
## 화면에서 확인되는 사실
(측정 가능하고 반박 불가능한 것만. 카드 개수, 스크롤 깊이, 탭 수, 문구 그대로)

## UX 관점 해석 (가설)
(반드시 "~할 가능성이 있다" 형태)
```

### 5-3. `competitor-protocol`

- User Task 5개 고정 (`PROJECT_PLAN.md` W1 참조)
- 캡처 파일명 규칙: `{앱}_{T##}_{step##}.png`
- 근거 등급 A~D 강제. D는 카드 생성 금지
- 출력은 기능 목록이 아니라 **Task별 비교표** (각 앱이 같은 목적을 몇 단계로, 어떤 UI로 해결하는가)

### 5-4. `synthesis-method`

- 삼각검증 절차: 서로 다른 종류의 근거 2개 이상이 같은 방향을 가리킬 때만 가설화
- `source_types`가 1종뿐인 가설은 생성 금지
- H 카드 포맷 + 근거 ID 인용 강제
- 출력 상한: 초안 10개 이내 (팀이 5~7개로 압축)

### 5-5. `survey-design`

체크리스트로 강제할 항목:
- 유도질문 금지 ("~가 불편하지 않나요?" → "~를 어떻게 느끼셨나요?")
- 이중질문 금지 ("쉽고 빠른가요?" → 분리)
- 사회적 바람직성 편향 (보험 지식을 묻는 문항은 자기평가 대신 실제 확인 문항으로)
- 스크리닝 문항 (SuperSOL 실사용 여부, 연령대)
- 척도 통일 (5점 또는 7점 중 하나로 고정)
- **소요시간 10분 이내** — 문항 수 상한 25개
- 마지막에 2차 테스트 참여 의향 체크 + 별도 폼 링크

### 5-6. `usability-test-protocol`

강제 항목:
- **counterbalancing** — 참가자 절반은 기존→프로토타입, 절반은 반대
- **동일 구조·다른 시나리오** Task 설계
- Task Success 판정 기준을 사전에 문서화 (무엇을 성공으로 볼 것인가)
- 지표 등급: 주력(성공률/Step수/SEQ) > 보조(이해도/만족도) > 참고(Time on Task)
- 모더레이터 대본 (개입 금지 구간 명시)
- 동의서 확인 절차

### 5-7. `deliverable-format`

발표자료 구조. W0에 `08_deliverable/outline.md`로 미리 생성해 빈 슬라이드를 박아둡니다.
특히 다음 두 슬라이드는 **처음부터 목차에 자리를 만들어 둡니다.**
- "우리가 틀렸던 것" (Rejected 가설)
- "한계점" (표본 규모, 프로토타입 조건 차이, 순서 효과)

---

## 6. Sub-agent (`.claude/agents/`)

### 공통 규칙 — 모든 agent 프롬프트 말미에 삽입

```
- CLAUDE.md의 Research Rule 12개를 반드시 준수한다.
- 결과 본문을 메인 스레드로 반환하지 말 것.
  생성한 파일 경로, ID 목록, 3줄 요약, 사람의 판단이 필요한 사항만 반환한다.
- 근거가 없으면 카드를 만들지 말고 _meta/source_wishlist.md에 기록한다.
- 단정 표현을 쓰지 않는다.
```

### agent 목록과 도구 권한

| agent | tools | 쓰기 허용 경로 |
|---|---|---|
| `desk-researcher` | WebSearch, WebFetch, Read, Write | `01_evidence/desk/` |
| `competitor-analyst` | Read(이미지), WebFetch, Write | `01_evidence/competitor/` |
| `screen-analyst` | Read(이미지), Write | `01_evidence/screen/` |
| `synthesizer` | Read, Grep, Glob, Write | `02_hypothesis/draft/` **만** |
| `survey-designer` | Read, Write | `03_validation/design/` |
| `data-analyst` | Read, Bash(python), Write | `03_validation/analysis/`, `07_usertest/analysis/` |
| `red-team-auditor` | Read, Grep, Glob, Write | `_meta/` **만** |

**쓰기 경로를 제한하는 이유:** `desk-researcher`가 실수로 `02_hypothesis/`를 덮어쓰면 추적성이 끊깁니다. 감사역은 읽기 전용에 리포트만 쓰게 해서, 자기가 지적한 걸 자기가 고치는 상황을 막습니다.

### `red-team-auditor` 점검 항목

```
1. 근거 없는 단정 표현 (CLAUDE.md 금지 표현 목록)
2. 출처 4요소(기관/발행일/URL·경로/페이지)가 빠진 E 카드
3. source_types가 1종뿐인 H 카드
4. validated_by가 비어 있는데 04_painpoint/에 있는 P 카드
5. pain_point 필드가 없는 SOL 카드
6. 존재하지 않는 ID를 인용하는 카드
7. 설문 문항의 유도성·이중질문·사회적 바람직성 편향
8. Gate 1 시점에 rejected 상태 가설이 0건인 경우 → 경고
   (설문이 유도적이었을 가능성)
9. 근거 등급 D인데 발표자료에 인용된 항목
```

### `desk-researcher` 추가 지침

```
우선 조회 기관:
보험연구원(KIRI), 보험개발원(KIDI), 금융위원회, 금융감독원,
한국소비자원, 컨슈머인사이트, KB금융지주 경영연구소,
하나금융경영연구소, 정보통신정책연구원(KISDI), DBpia/RISS

- 검색 결과 요약 기사는 근거로 쓰지 않는다. 원본 보고서를 찾는다.
- 원본을 찾으면 사용자에게 다운로드를 요청하고,
  01_evidence/desk/sources/{기관}_{연도}_{제목}.pdf 로 저장하게 한다.
- 저장된 로컬 PDF를 읽고 페이지 번호까지 인용한다.
- 3회 시도 후에도 원본을 못 찾으면 _meta/source_wishlist.md에 기록하고 넘어간다.
```

---

## 7. `traceability-check` 스크립트

`scripts/traceability_check.py` — 링크 무결성을 기계적으로 검사합니다.

### 검사 항목

| # | 검사 | 심각도 |
|---|---|---|
| 1 | 존재하지 않는 ID를 인용하는 카드 | ERROR |
| 2 | `source_types`가 1종뿐인 H 카드 | ERROR |
| 3 | `validated_by`가 비어 있는 P 카드 | ERROR |
| 4 | `pain_point` 필드가 없거나 존재하지 않는 P를 가리키는 SOL 카드 | ERROR |
| 5 | 출처 4요소가 빠진 E 카드 | ERROR |
| 6 | 어떤 H에도 인용되지 않은 근거 카드 (고아) | WARN |
| 7 | 근거 등급 D인 C 카드가 존재 | WARN |
| 8 | ID 중복 | ERROR |
| 9 | ID 대역 위반 (담당자 대역 밖 번호 사용) — O·E·S·C·SOL만 대상. **H·P·M은 대역이 없으므로 검사 제외** | WARN |

### 출력

`_meta/traceability.md`에 마크다운 리포트로 저장합니다.
ERROR가 1건이라도 있으면 exit code 1을 반환합니다.

**운영:** 주 1회(일요일) + 각 Gate 직전 + 9/17 최종 실행.
최종 리포트는 발표 부록으로 쓸 수 있습니다. "우리 프로젝트의 모든 주장이 근거에 연결되어 있음"을 기계적으로 증명하는 자료입니다.

---

## 8. 프로토타입 환경 (W3부터 준비)

| 항목 | 선택 |
|---|---|
| 디자인 | Figma (팀 파일, 팀원2 주도) |
| 구현 | React + Vite, TypeScript |
| 스타일 | Tailwind CSS |
| 데이터 | 더미 JSON. 백엔드 없음 |
| 배포 | Vercel 또는 GitHub Pages — 참가자 휴대폰에서 URL 접속 |
| 뷰포트 | 모바일 웹 전용. 390×844 기준 |

**8/24~8/27에 미리 만들어둘 것 (필수)**

이걸 안 하면 9/7~9/9 3일 안에 프로토타입이 안 나옵니다.

- [ ] Vite + React + TS + Tailwind 프로젝트 생성 및 배포 파이프라인 확인
- [ ] Figma 디자인 시스템 (색상 토큰, 타이포, 버튼/카드/탭 컴포넌트)
- [ ] 공통 레이아웃 (상단바, 하단탭, 모바일 프레임)
- [ ] 더미 데이터 스키마 (보험 계약, 보장 항목, 상품)
- [ ] 사용자 행동 로깅 (클릭 수·화면 전환 자동 기록 → 테스트 지표 자동 수집)

마지막 항목을 권합니다. Step 수를 손으로 세는 것보다 정확하고, 테스트 진행자(팀원3)의 부담이 크게 줄어듭니다.

---

## 9. 세팅 체크리스트

### 8/5(수)
- [ ] 저장소 생성, 폴더 구조, `.gitignore`
- [ ] `CLAUDE.md`
- [ ] `.claude/settings.json` (위험 명령어 차단)
- [ ] 팀원 3명 접근 권한 부여

### 8/6(목)
- [ ] `/start`, `/save` 커맨드
- [ ] `evidence-card` Skill + `build_index.py`
- [ ] **팀원3과 함께 `/start` → 파일 생성 → `/save` 1회 실습**

### 8/7(금)
- [ ] Skill 나머지 6개
- [ ] Sub-agent 7개
- [ ] `traceability_check.py`
- [ ] `/audit` 1회 시범 실행

### 8/8~8/9
- [ ] `08_deliverable/outline.md`, `limitations.md` 뼈대 생성
- [ ] `_meta/decision_log.md`, `source_wishlist.md` 생성
- [ ] 팀 전체 첫 커밋 확인

---

## 10. 세팅 시 주의

**index.csv를 소스로 만들지 마세요.** 이 프로젝트에서 Git 충돌이 날 수 있는 거의 유일한 지점입니다. 반드시 생성물로 처리하세요.

**agent를 더 만들지 마세요.** 7개면 충분합니다. agent가 늘어날수록 어떤 걸 언제 부르는지 사람이 헷갈리고, 프롬프트 유지보수 비용이 커집니다. 새 작업이 생기면 새 agent가 아니라 새 Skill로 해결하세요.

**Skill과 CLAUDE.md를 헷갈리지 마세요.**
항상 지켜야 할 규칙 = `CLAUDE.md` / 특정 작업할 때만 필요한 절차 = Skill.
Research Rule을 Skill에 넣으면 로드 안 될 때 규칙이 무시됩니다.
