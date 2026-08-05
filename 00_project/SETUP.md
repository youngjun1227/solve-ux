# SETUP.md — 기술 세팅 가이드

**대상: 팀장 (세팅 담당자)**
이 문서는 저장소·AI 도우미·자동 검사를 세팅하는 방법입니다. 팀원1~3은 읽지 않아도 됩니다.
프로젝트 전체 내용은 `PROJECT_PLAN.md`를 보세요.

**세팅 완료 목표: 2026년 8월 7일(금)**

---

## 0. 어느 규칙이 어디에 있는가 — 정본 표

**이 표가 이 문서에서 가장 중요합니다.** 규칙이 여러 곳에 복제되면 하나를 고쳤을 때
나머지가 조용히 어긋나고, 어느 쪽이 맞는지 아무도 모르게 됩니다.

**규칙을 바꿀 때는 정본만 고칩니다. 나머지 위치에는 규칙을 적지 말고 정본을 가리키세요.**

| 규칙 | 정본 (여기만 고친다) | 나머지 위치의 역할 |
|---|---|---|
| 절대 규칙 (Research Rule 12개) | `CLAUDE.md` | 참조만 |
| ID 대역 · 승격 경로 · 카드 필수 필드 | `CLAUDE.md` | 참조만 |
| 금지 표현 | `CLAUDE.md` | 참조만 |
| 근거 등급 A~D | `CLAUDE.md` | Skill은 적용 방법만 설명 |
| `source_types` 2종 규칙 | `CLAUDE.md` | 검출은 `traceability_check.py` |
| 파일 소유권 | `CLAUDE.md` | PROJECT_PLAN 5절은 쉬운 말 설명 |
| 커밋 가능 경로 | `scripts/paths.py` | `.gitignore`는 사본 — **수동 동기화** |
| 카드 상수 (대역·필드·본문 구조) | `scripts/cards.py` | 문서 쪽 원본은 `CLAUDE.md` |
| 기계 검사 항목 | `scripts/traceability_check.py` | 이 문서 7절은 목록만 |
| 커밋 메시지 규칙 | `.claude/commands/save.md` | 이 문서 2절은 참조 |
| 카드 작성 절차 (공통) | `.claude/skills/evidence-card/` | 이 문서 5-1절은 참조 |
| 화면 분석 절차 · 경쟁사 절차 | 해당 `.claude/agents/*.md` | Skill로 빼지 않는다 (5절 기준) |
| 캡처 폴더 · 파일명 · 형식 | `CLAUDE.md` "캡처 파일" | HOWTO 3-4·3-5는 조작법만 |
| 멘토 확인 규칙 | `CLAUDE.md` "멘토 확인" | `_meta/mentor/README.md`·HOWTO 4-6은 쉬운 말 설명 |
| 멘토 회의 준비 절차 | `.claude/agents/mentor-liaison.md` | Skill로 빼지 않는다 (5절 기준) |
| Gate 통과 기준 | `PROJECT_PLAN.md` | `/gate1` `/gate2`는 읽어서 제시 |
| 일정 · 역할 · 용어 | `PROJECT_PLAN.md` | 참조만 |
| 팀원 첫날 안내 | `00_project/START_HERE.md` | HOWTO·PROJECT_PLAN을 가리키기만 한다 |

**수동 동기화가 필요한 곳은 한 군데뿐입니다** — `.gitignore`는 파이썬을 import 할 수
없으므로 `scripts/paths.py`의 사본입니다. 양쪽 주석에 그렇게 적어뒀습니다.

### 복제해도 되는 예외 — 짧은 상수

**매 순간 필요한 짧은 상수는 복제합니다. 절차와 규칙은 참조합니다.**

뿌리 ④가 막으려던 것은 *규칙이 여러 곳에 있어 서로 어긋나는 것*입니다.
ID 대역 같은 4줄짜리 상수는 어긋날 여지가 거의 없고, 대신 참조로 두면
**작업하는 그 순간에 다른 문서를 열게 만듭니다.**

| | 어떻게 |
|---|---|
| ID 대역 (4줄) | HOWTO 3절에 **복제**. 카드를 만드는 매 순간 필요하다 |
| 커밋 메시지 규칙 (절차) | `/save`에만. 사람이 직접 쓸 일이 없다 |
| 커맨드 목록 (참고 정보) | PROJECT_PLAN 7절 참조. 존재만 알면 된다 |

복제할 때는 **어느 쪽이 정본인지 주석으로 표시**합니다.
HOWTO 3절 대역표에 그렇게 해뒀습니다.

---

## 1. 세팅 순서와 진행 상황

우선순위대로입니다. 1~4까지만 되면 팀원들이 합류할 수 있습니다.

| # | 항목 | 상태 |
|---|---|---|
| 1 | 저장소 + 폴더 구조 + `.gitignore` | ✅ 완료 |
| 2 | `CLAUDE.md` (프로젝트 헌법) | ✅ 완료 |
| 3 | `/start` `/save` 커맨드 + 위험 명령어 차단 | ✅ 완료 |
| 4 | `evidence-card` Skill + `build_index.py` | ✅ 완료 |
| 5 | 경로 검사 · 추적성 검사 · Gate 커맨드 | ✅ 완료 |
| 6 | 리서치 agent 3개 + red-team-auditor + synthesizer | ✅ 완료 |
| 7 | `mentor-liaison` agent + X 카드 + 게이트 기록 검사 | ✅ 완료 |
| 8 | `survey-designer` `data-analyst` + Skill 2개 | ⬜ 설문 설계·회수 전까지 |

8번의 배치는 `architecture_review.md` 4절 표를 따릅니다.

---

## 2. 저장소 초기화

### 폴더 구조

```bash
mkdir -p solve-ux/{00_project,01_evidence/{team,desk/sources,screen,competitor,screens},02_hypothesis/draft,03_validation/{design,raw,anonymized,analysis},04_painpoint,05_solution,06_prototype,07_usertest/{protocol,raw,anonymized,analysis},08_deliverable,_meta,.claude/{agents,skills,commands}}
```

각 폴더에 `.gitkeep`을 넣어 빈 폴더도 커밋되게 합니다.

### 커밋 가능 경로

**정본은 `scripts/paths.py`입니다.** 여기에 목록을 옮겨 적지 마세요.

설계 원칙만 적습니다 — 개인정보가 들어올 수 있는 폴더는 **차단 후 허용**(화이트리스트)으로
운영합니다. `03_validation/`과 `07_usertest/` 아래는 정해진 하위 폴더만 커밋되고
나머지는 전부 막힙니다. 확장자·파일명 블랙리스트는 이름을 바꾸면 뚫리므로 2·3차
방어선으로만 씁니다.

`.gitignore`는 **1차 방어선일 뿐입니다.** 이미 추적 중인 파일은 막지 못합니다
(`.DS_Store`와 `__pycache__`가 실제로 그렇게 들어온 적이 있습니다). 실제 방어는
`python3 scripts/check_commit_paths.py --all`이 합니다.

### 브랜치 정책

**main 하나만 사용합니다.** 브랜치를 쓰지 않습니다.
6절의 소유권 분리 덕분에 충돌이 구조적으로 안 나므로 브랜치의 이득이 거의 없고, 비개발자 팀원이 가장 많이 깨뜨리는 지점입니다.

### 🚨 충돌이 났을 때 — 팀장용 복구 절차

> 팀원이 "파일이 겹쳤다"는 화면을 단톡에 붙여넣었을 때 여기를 보세요.
> **30초면 끝납니다.**

#### 1. 무슨 일이 일어난 것인가

두 사람이 **같은 파일의 같은 부분**을 고쳤고, 나중에 `/save`한 사람이 멈춘 것입니다.
거의 항상 `_meta/decision_log.md` 같은 **번호 없는 공용 파일**에서 납니다.
카드는 대역이 갈려서 이 일이 안 생깁니다.

#### 2. 팀원에게 먼저 이 말을 해주세요

> **작업한 내용은 사라지지 않았습니다.**

`git log`를 보면 방금 만든 커밋이 없어진 것처럼 보입니다. 실제로는 남아 있습니다.
이 말을 안 해주면 팀원이 당황해서 이것저것 시도하고, **그때 진짜로 잃습니다.**

#### 3. 원상복구 — 한 줄

팀원 화면에서 실행하게 합니다.

```
git rebase --abort
```

이 한 줄로 `/save` 치기 직전 상태로 돌아갑니다. **커밋은 그대로 살아 있습니다.**

- `rebase --abort`는 **deny 목록에 없습니다.** 차단되는 것은 `git rebase -i`뿐입니다
- 되돌리는 명령이 아니라 **중단하는** 명령이라 안전합니다

#### 4. 그 다음 — `--abort`만으로는 안 끝납니다

⚠️ **`--abort` 직후에 바로 `git pull --rebase`를 치면 같은 충돌이 또 납니다.**
팀원의 커밋이 그대로 남아 있어서 다시 겹치기 때문입니다. 아래 순서를 지키세요.

**먼저 팀원에게 자기가 적은 내용을 메모장에 복사해두게 합니다.** 그 다음 팀원
화면에서 이 네 줄을 순서대로 칩니다.

```
git reset --soft HEAD~1                    # 커밋만 취소, 내용은 남음
git restore --staged .                     # 올리기 대기 상태 해제
git checkout -- _meta/decision_log.md      # 겹친 파일만 원래대로
git pull --rebase                          # 이제 깨끗하게 받아짐
```

세 번째 줄의 파일명은 **실제로 겹친 파일**로 바꿉니다.

그리고 팀원이 메모해둔 내용을 다시 붙여넣고 `/save` 하면 됩니다.
앞사람 것이 이미 들어와 있으므로 **이번에는 겹치지 않습니다.**

> `git checkout -- <파일>`이 여기서 쓰입니다. 이 명령을 deny 목록에서 **일부러
> 뺀 이유**가 이 상황입니다(4절 참고). 막아뒀다면 복구 경로가 없어 매번
> 저장소를 다시 clone해야 했을 것입니다.

**검증 완료** — 위 순서로 A·B 두 사람의 줄이 모두 살아남는 것을 확인했습니다.

#### 5. 다시 안 나게 하려면

**공용 파일은 회의 중에만, 한 사람이 대표로 수정합니다.** `CLAUDE.md` 규칙입니다.
회의에서 결정 4가지를 적을 때 두 명이 각자 적으면 바로 이 상황이 됩니다.
**한 명이 화면 공유하며 적고 그 사람만 `/save` 하세요.**

#### 6. 절대 제안하지 않는 것

`git reset --hard` · `git push --force` · 충돌 파일을 직접 편집해서 밀어 넣기.
전부 남의 작업을 날릴 수 있습니다. `--abort`로 충분합니다.

### 커밋 메시지 규칙

**정본은 `.claude/commands/save.md`입니다.** 형식과 예시는 그쪽에 있습니다.
`/save`가 규칙을 읽고 메시지를 만들어야 하므로 커맨드 안에 있어야 합니다.

여기서는 왜 그 형식인지만 적습니다 — `git log --oneline`이 그대로 진행 상황판이
되게 하기 위해서입니다. **별도 워크로그 파일은 만들지 마세요.** 그 자체가 충돌
유발자입니다.

---

## 3. `CLAUDE.md` (프로젝트 헌법)

**실제 파일은 저장소 루트의 `CLAUDE.md`입니다. 그것이 정본입니다.**
여기에 내용을 옮겨 적지 마세요. 사본을 두면 반드시 어긋납니다.

### 무엇을 넣고 무엇을 넣지 않는가

모든 세션에서 항상 로드되므로 **조건부가 아니라 무조건 지켜야 할 것만** 넣습니다.

- ⭕ 항상 지켜야 할 규칙 → `CLAUDE.md`
- ❌ 특정 작업을 할 때만 필요한 절차 → Skill

Research Rule을 Skill에 넣으면 Skill이 로드되지 않을 때 규칙이 통째로 무시됩니다.
이건 실제 위험입니다. Skill 호출은 보장되지 않습니다.

### 현재 담고 있는 것

프로젝트 개요 · 절대 규칙 12개 · ID 규칙 · **카드 승격 경로** · 카드 필수 필드 ·
금지 표현 · 파일 소유권 · 커밋 경로 화이트리스트.

승격 경로가 핵심입니다. `P`는 `/gate1`로만, `M`은 `/gate2`로만 생성되며 다른 경로로
만들어진 카드는 검사에서 ERROR로 잡힙니다. 폴더가 아니라 이 규칙이 게이트입니다.

---

## 4. 커맨드 (`.claude/commands/`)

**각 커맨드의 정본은 해당 `.md` 파일입니다.** 여기에 내용을 옮겨 적지 않습니다.
무엇이 있고 왜 나눴는지만 적습니다.

| 커맨드 | 누가 쓰나 | 하는 일 |
|---|---|---|
| `/start` | 전원 | 최신 자료 받아오기 → 목록 재생성 → 변경 요약 → 마감 임박 경고 |
| `/save` | 전원 | 경로 검사 → 확인 → 커밋 → pull → push |
| `/anonymize` | 팀원3 | `raw/` 원본에서 개인정보를 지운 사본을 `anonymized/`에 생성 |
| `/audit` | 팀장 | 추적성 **기계** 검사 (`traceability_check.py`) |
| `/redteam` | 팀장·팀원3 | **판단형** 감사 (유도질문·단정 표현). agent는 8/8~8/14 부착 |
| `/gate1` | 팀 전원 | Gate 1 진행. **P 카드를 만드는 유일한 경로** |
| `/gate2` | 팀 전원 | Gate 2 진행. **M 카드를 만드는 유일한 경로** |

### `/audit`과 `/redteam`을 나눈 이유

`/audit`은 기계적으로 참/거짓이 갈리는 것만 봅니다 — 없는 ID 인용, 필수 필드 누락,
대역 위반. `/redteam`은 판단이 필요한 것을 봅니다 — 설문이 유도질문인지, 단정 표현을
썼는지.

둘을 한 커맨드에 묶으면 **"감사 통과"가 무엇을 통과했다는 뜻인지 흐려집니다.**
Gate 체크리스트의 판정 근거로 쓰려면 기계 검사 쪽이 통과/실패가 명확해야 합니다.

### `/evidence`는 만들지 않았습니다

초안에 있던 `/evidence <주제>`는 agent를 고르는 얇은 래퍼일 뿐이라 제외했습니다.
리서치 agent는 직접 부르면 됩니다. 커맨드가 늘어날수록 비개발자가 외울 것만 늘어납니다.

### `.claude/settings.json` — 위험 명령어 차단

정본은 `.claude/settings.json`입니다. deny 6개가 들어 있습니다.

`git checkout -- *`는 **일부러 허용했습니다.** `push --force`나 `reset --hard`는 남의
작업을 날리지만 이건 자기 작업만 되돌리는 복구 도구입니다. 막아두면 사소한 실수마다
팀장이 호출됩니다.

---

## 5. Skill (`.claude/skills/`)

### Skill로 만들지, agent 안에 둘지 — 판단 기준

**쓰는 쪽이 둘 이상이면 Skill, 하나뿐이면 그 agent 안에 둡니다.**

| 절차 | 쓰는 쪽 | 그래서 |
|---|---|---|
| `evidence-card` | 사람(팀원 4명) + 리서치 agent 3종 | **Skill** — 공유해야 한다 |
| 화면 분석 12개 관점 | `screen-analyst` 하나 | agent 안 |
| 경쟁사 Task 5개·캡처 규칙 | `competitor-analyst` 하나 | agent 안 |

쓰는 쪽이 하나인데 Skill로 빼면 **참조가 한 단계 늘어날 뿐이고, 같은 내용이 두 곳에
생깁니다.** 0절 정본 표가 막으려는 바로 그 상황입니다.

Skill 호출은 보장되지 않는다는 점도 걸립니다. agent 프롬프트는 그 agent가 돌 때
반드시 로드되지만, Skill은 안 불릴 수 있습니다. 한 agent만 쓰는 절차라면
agent 안에 두는 쪽이 더 확실합니다.

### 5-1. `evidence-card` — 완료

**정본은 `.claude/skills/evidence-card/SKILL.md`입니다.** 카드 포맷과 ID 발급 절차는
그쪽에 있습니다. 여기에 옮겨 적지 마세요.

설계 근거만 적습니다.

**index.csv는 소스가 아니라 생성물입니다.** 4명이 동시에 같은 CSV 끝에 줄을 추가하면
100% 충돌합니다. `scripts/build_index.py`가 카드 front-matter를 스캔해 매번 재생성하고,
`scripts/paths.py`의 `GENERATED`에 넣어 커밋을 막습니다.

**ID는 사람이 세지 않습니다.** `scripts/next_id.py`가 자기 대역의 마지막 번호 +1을
계산합니다. 대역이 사람마다 분리돼 있어 4명이 동시에 발급해도 겹치지 않습니다.
카드 상수(대역·필수 필드·본문 구조)의 정본은 `scripts/cards.py`입니다.

### 5-2. `screen-analysis-framework` — Skill로 만들지 않습니다

**`SKILL.md`를 찾지 마세요. 없습니다.** 내용은 `.claude/agents/screen-analyst.md`
안에 있습니다.

쓰는 쪽이 `screen-analyst` 하나뿐이라 위 판단 기준에 따라 agent 안에 뒀습니다.
`evidence-card`와 대비하면 명확합니다 — 그쪽은 사람과 agent 4종이 공유하므로
Skill이고, 이쪽은 한 agent만 쓰므로 agent 안입니다.

agent 안에 들어 있는 것:
12개 관점(Information Architecture / User Flow / Navigation / Discoverability /
Information Hierarchy / Cognitive Load / Terminology / CTA / Consistency /
Personalization / Accessibility / 콘텐츠 구조) · 2단 분리 서식 ·
캡처 파일명 규칙 · 안 읽히는 요소 처리.

**12개를 다 채우지 않게** 하는 지시도 agent 안에 있습니다. 억지로 채우면
근거 없는 문장이 생기고, 그게 이 프로젝트가 막으려는 것입니다.

### 5-3. `competitor-protocol` — Skill로 만들지 않습니다

**`SKILL.md`를 찾지 마세요. 없습니다.** 내용은
`.claude/agents/competitor-analyst.md` 안에 있습니다. 이유는 5-2와 같습니다.

agent 안에 들어 있는 것:
User Task 5개(T01~T05) · 캡처 파일명 규칙 `{앱}_{T##}_{step##}_{YYYYMMDD}.png` ·
근거 등급 적용(기준의 정본은 `CLAUDE.md` 절대 규칙 6번, D등급은 카드 생성 금지) ·
Task별 비교표 형식 · 우열 판정 금지.

### 5-4~5-6 — 만들 때 위 판단 기준으로 다시 정할 것

아래 셋은 아직 만들지 않았습니다. 만들 때 **"쓰는 쪽이 둘 이상인가"**를 먼저 보세요.
지금 예상은 이렇습니다.

| | 쓰는 쪽 | 예상 |
|---|---|---|
| `synthesis-method` | `synthesizer` 하나 | agent 안 ✅ 확정 |
| `survey-design` | `survey-designer` + `red-team-auditor`(유도질문 검사) | Skill |
| `usability-test-protocol` | 팀원3(사람) + `data-analyst` | Skill |

아래 내용은 어디에 넣든 그대로 씁니다.

### 5-4. `synthesis-method` — Skill로 만들지 않습니다

**`SKILL.md`를 찾지 마세요. 없습니다.** 내용은 `.claude/agents/synthesizer.md`
안에 있습니다. 쓰는 쪽이 `synthesizer` 하나뿐이라 위 판단 기준을 따랐습니다.

agent 안에 들어 있는 것:
- 삼각검증 — 서로 다른 종류 2개 이상이 같은 방향을 가리킬 때만 가설화
- **종류를 세기 전에 그 근거가 가설의 주어를 지지하는지 확인** —
  형식상 2종인데 실질 1종인 경우를 걸러낸다. `#2` 검사가 못 잡는 지점이다
- 주어 대조 — 근거의 조사 대상과 가설의 주어가 어긋나면 좁히거나 만들지 않는다
- **`index.csv` 요약부터 읽는다.** 8/16이면 카드가 수백 장이라 전문을 다 읽으면
  컨텍스트가 끊긴다. `summary`를 필수로 만든 이유가 이것이다
- 초안은 `02_hypothesis/draft/`에만. 확정은 8/17 회의
- 출력 상한 10개 (팀이 5~7개로 압축)
- 억지로 묶지 않는다 — 고립 카드가 있는 것은 정상이다

### 5-5. `survey-design` — 8/19 전

체크리스트로 강제할 항목:
- 유도질문 금지 ("~가 불편하지 않나요?" → "~를 어떻게 느끼셨나요?")
- 이중질문 금지 ("쉽고 빠른가요?" → 분리)
- 사회적 바람직성 편향 (보험 지식을 묻는 문항은 자기평가 대신 실제 확인 문항으로)
- 스크리닝 문항 (SuperSOL 실사용 여부, 연령대)
- 척도 통일 (5점 또는 7점 중 하나로 고정)
- **소요시간 10분 이내** — 문항 수 상한 25개
- 마지막에 2차 테스트 참여 의향 체크 + 별도 폼 링크

### 5-6. `usability-test-protocol` — 8/24 전

강제 항목:
- **counterbalancing** — 참가자 절반은 기존→프로토타입, 절반은 반대
- **동일 구조·다른 시나리오** Task 설계
- Task Success 판정 기준을 사전에 문서화 (무엇을 성공으로 볼 것인가)
- 지표 등급: 주력(성공률/Step수/SEQ) > 보조(이해도/만족도) > 참고(Time on Task)
- 모더레이터 대본 (개입 금지 구간 명시)
- 동의서 확인 절차

### 5-7. `deliverable-format` — Skill로 만들지 않습니다

7주 동안 한 번(W0에 목차 생성) 쓰고 끝나는 절차라 Skill일 이유가 없습니다.
`08_deliverable/outline.md`를 **템플릿 파일로 직접 만들어** 빈 슬라이드를 박아둡니다.

특히 다음 두 슬라이드는 **처음부터 목차에 자리를 만들어 둡니다.**
- "우리가 틀렸던 것" (Rejected 가설)
- "한계점" (표본 규모, 프로토타입 조건 차이, 순서 효과)

이 두 개는 PROJECT_PLAN 9절의 "절대 자르면 안 되는 5가지"에 포함됩니다.
목차에 자리가 없으면 마지막 주에 빠집니다.

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
| `desk-researcher` | WebSearch, WebFetch, Read, Write, Bash | `01_evidence/desk/` |
| `competitor-analyst` | Read, Write, Bash, Glob<br>🚫 **웹 도구 절대 추가 금지**<br>웹에는 마케팅 자료뿐이라 도구가 있으면 캡처 없이 "토스는 이렇게 한다"를 지어낸다. PROJECT_PLAN W1이 순서를 뒤집은 이유가 이것 | `01_evidence/competitor/` |
| `screen-analyst` | Read, Write, Bash, Glob<br>🚫 **웹 도구 절대 추가 금지**<br>SuperSOL 화면도 로그인해야 보인다. 같은 이유 | `01_evidence/screen/` |
| `synthesizer` | Read, Grep, Glob, Write | `02_hypothesis/draft/` **만** |
| `survey-designer` | Read, Write | `03_validation/design/` |
| `data-analyst` | Read, Bash(python), Write | `03_validation/analysis/`, `07_usertest/analysis/` |
| `red-team-auditor` | Read, Grep, Glob, Write | `_meta/` **만** |

**쓰기 경로를 제한하는 이유:** `desk-researcher`가 실수로 `02_hypothesis/`를 덮어쓰면 추적성이 끊깁니다. 감사역은 읽기 전용에 리포트만 쓰게 해서, 자기가 지적한 걸 자기가 고치는 상황을 막습니다.

**웹 도구가 없는 두 agent — 친절하게 추가하지 마세요.**

`competitor-analyst`와 `screen-analyst`가 도구를 못 받은 것처럼 보일 수 있습니다.
**일부러 뺀 것입니다.**

경쟁 앱의 실제 화면은 로그인해야 보입니다. 웹에서 찾을 수 있는 것은 마케팅 자료뿐이고,
그것으로 "토스는 이렇게 한다"고 쓰면 그럴듯하지만 틀린 카드가 만들어집니다.
발표에서 심사자가 앱을 열어보면 바로 드러납니다.

PROJECT_PLAN W1이 순서를 뒤집은 이유가 이것입니다 — **사람이 먼저 직접 찍고, AI는
그 캡처만 봅니다.**

웹 도구를 주면 이 안전장치가 프롬프트 문구 하나에만 의존하게 됩니다.
도구를 빼면 구조가 대신 막습니다. **"근거 없으면 쓰지 마라"고 적어두는 것보다
쓸 수단을 없애는 것이 확실합니다.**

초안 표에는 `competitor-analyst`에 WebFetch가 있었습니다. 그대로 만들었다면
이 원칙이 통째로 무너졌을 것입니다. 그래서 금지 문구를 표 안에 넣어뒀습니다.

### `red-team-auditor` 점검 항목 — 판단이 필요한 것만

**기계가 잡을 수 있는 것은 여기서 다시 보지 않습니다.** 없는 ID 인용, 필수 필드 누락,
출처 4요소, `source_types` 종류 수, 대역 위반은 전부 `traceability_check.py`가 잡습니다
(7절). 같은 검사를 두 번 돌리면 유지보수 비용만 늘고 결과가 섞입니다.

```
1. 근거 없는 단정 표현 (정본: CLAUDE.md 금지 표현)
2. 설문 문항의 유도성·이중질문·사회적 바람직성 편향
3. Gate 1 시점에 rejected 상태 가설이 0건인 경우 → 경고
   (설문이 유도적이었을 가능성)
4. 근거 등급 D인데 발표자료에 인용된 항목
   (D 카드의 존재 자체는 traceability_check #7 소관)
5. AI가 만든 카드에서 "가능성"이 아니라 "사실"로 쓰인 문장
6. "이 자료의 한계" 칸이 형식만 채워진 것
7. 해석이 자료 범위를 넘어선 것 — 검증에서 가장 놓치기 쉬웠던 항목
```

정본은 `.claude/commands/redteam.md`입니다.

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

**정본은 `scripts/traceability_check.py`입니다.** 아래 표는 목록일 뿐이며, 검사를
추가·수정할 때는 스크립트를 고칩니다.

### 검사 항목 (18개)

| # | 검사 | 심각도 |
|---|---|---|
| 1 | 존재하지 않는 ID를 인용하는 카드 | ERROR |
| 2 | `source_types`가 1종뿐인 H 카드 | ERROR |
| 3 | P 카드 스키마 — `hypothesis`·`survey_q`·`n`·`rate`·`gate` | ERROR |
| 4 | `pain_point` 필드가 없거나 존재하지 않는 P를 가리키는 SOL 카드 | ERROR |
| 5 | 출처 4요소가 빠진 E 카드 | ERROR |
| 6 | 어떤 H에도 인용되지 않은 근거 카드 (고아) | WARN |
| 7 | 근거 등급 D인 카드가 존재 (E·C 공통) | WARN |
| 8 | ID 중복·형식 오류 | ERROR |
| 9 | ID 대역 위반 — O·E·S·C·SOL만 대상. **H·P·M은 대역이 없으므로 제외** | WARN |
| 10 | M 카드 스키마 — `solution`·`pain_point`·`metric`·`baseline`·`result` | ERROR |
| 11 | S 카드 스키마 — `screen`·`captured` | ERROR |
| 12 | 공통 필수 필드 — `type`·`author`·`date`·`summary` | ERROR |
| 13 | C 카드 스키마 — `app`·`user_task`·`grade`·`capture`·`captured` | ERROR |
| 14 | X 카드 스키마 — `answer_type`·`confidential` 값이 정해진 것인가 | ERROR |
| 15 | 멘토 의견(`opinion`)을 H·SOL의 근거로 인용 | ERROR |
| 16 | 카드가 정해진 폴더 밖에 있음 (P는 `04_painpoint/`, M은 `07_usertest/measurement/`) | ERROR |
| 17 | 캡처가 `01_evidence/screens/` 밖이거나, 파일이 없거나, PNG/JPG가 아님 | ERROR |
| 18 | P·M 카드가 게이트 기록(`_meta/gate1_record.md`·`gate2_record.md`)에 없음 | ERROR |

**#15는 초안(`draft/`)에서도 ERROR입니다 — 일부러 그렇습니다.**
다른 지적은 초안이면 WARN으로 낮춥니다. 초안은 아직 회의를 통과하지 않았으니
필드가 비어 있는 것이 정상이기 때문입니다. 그런데 멘토 의견을 근거로 삼은 것은
**미완성이 아니라 규칙 위반**이고, 회의에 들고 가기 전에 고쳐야 합니다.

필수 필드 목록의 정본은 `scripts/cards.py`의 `EXTRA_FIELDS`이고,
문서 쪽 정본은 `CLAUDE.md`다. 검사 스크립트는 그 표를 읽어 쓸 뿐 목록을 따로 갖지 않는다.

**#3이 필드 존재만 보지 않는 이유:** `validated_by`가 비어 있지 않기만 하면 통과하던
초안 설계로는, 손으로 만든 P 카드가 그대로 통과합니다. 값이 실제로 있어야 합니다.

**#10을 추가한 이유:** 초안에는 M 검사가 없어 추적성이 SOL에서 끊겼습니다.
`Evidence→H→P→SOL→M`의 마지막 화살표를 검사하는 항목입니다.

**초안(`02_hypothesis/draft/`)의 지적은 WARN으로 낮춥니다.** 아직 회의를 통과하지
않은 카드이기 때문입니다.

### 출력

```
python3 scripts/traceability_check.py          # _meta/traceability.md 갱신
python3 scripts/traceability_check.py --save   # 날짜 붙은 사본도 남김
```

`_meta/traceability.md`는 매번 덮어쓰이는 갱신본이라 커밋되지 않습니다
(`scripts/paths.py`의 `GENERATED`). **발표 부록으로 쓰려면 `--save`가 필요합니다.**
날짜가 붙은 `_meta/traceability_YYYY-MM-DD.md`는 커밋됩니다.

ERROR가 1건이라도 있으면 exit code 1을 반환합니다.
카드가 한 장도 없어도 에러 없이 돌아갑니다.

**운영:** 주 1회(일요일) + 각 Gate 직전 + 9/17 최종 실행.
**Gate 직전과 최종은 `--save`로 돌립니다.** 최종 리포트는 발표 부록이 됩니다.
"우리 프로젝트의 모든 주장이 근거에 연결되어 있음"을 기계적으로 증명하는 자료입니다.

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

### 8/4(화) — 완료
- [x] 저장소 생성(private), 폴더 구조, `.gitignore`
- [x] `CLAUDE.md`, `.claude/settings.json`
- [x] `/start` `/save` `/anonymize` `/audit` `/redteam` `/gate1` `/gate2`
- [x] `paths.py` `check_commit_paths.py` `traceability_check.py`
- [x] `cards.py` `build_index.py` `next_id.py` + `evidence-card` Skill

### 8/5(수) — 킥오프
- [ ] 팀원 3명 접근 권한 부여
- [ ] **킥오프에서 O 카드 순서를 못박기 — 리서치 도우미보다 먼저**
- [ ] **팀원3과 함께 `/start` → O 카드 작성 → `/save` 1회 실습**
- [ ] `_meta/decision_log.md`, `source_wishlist.md` 생성

### 리서치 개시 전 확인 조건
- [x] agent 3개: `desk-researcher` `screen-analyst` `competitor-analyst`
      (Skill 2개는 만들지 않음 — 5-2·5-3절 참고)
- [ ] `/audit` 1회 시범 실행

### 8/8~8/9
- [ ] `08_deliverable/outline.md`, `limitations.md` 뼈대 생성
- [ ] `red-team-auditor` agent 부착 (`/redteam` 연결)
- [ ] 팀 전체 첫 커밋 확인

나머지 agent 4개와 Skill 3개는 필요해지는 날짜에 붙입니다 (1절 표).

---

## 10. 세팅 시 주의

**index.csv를 소스로 만들지 마세요.** 이 프로젝트에서 Git 충돌이 날 수 있는 거의 유일한 지점입니다. 반드시 생성물로 처리하세요.

**agent를 더 만들지 마세요.** 7개면 충분합니다. agent가 늘어날수록 어떤 걸 언제 부르는지 사람이 헷갈리고, 프롬프트 유지보수 비용이 커집니다. 새 작업이 생기면 새 agent가 아니라 새 Skill로 해결하세요.

**Skill과 CLAUDE.md를 헷갈리지 마세요.**
항상 지켜야 할 규칙 = `CLAUDE.md` / 특정 작업할 때만 필요한 절차 = Skill.
Research Rule을 Skill에 넣으면 로드 안 될 때 규칙이 무시됩니다.

**규칙을 두 곳에 적지 마세요.** 0절 정본 표를 먼저 보고, 정본에만 적으세요.
사본은 반드시 어긋나고, 어긋난 뒤에는 어느 쪽이 맞는지 아무도 모릅니다.
이 문서 자체가 한 번 그렇게 어긋났습니다 — `CLAUDE.md` 초안을 여기 복사해 둔 탓에
실제 파일과 8곳이 달라졌고, 그 상태로 agent를 만들었다면 틀린 설계를 그대로
옮겼을 것입니다.

**`.gitignore`만은 수동 동기화입니다.** 파이썬을 import 할 수 없어 어쩔 수 없습니다.
`scripts/paths.py`를 고치면 `.gitignore`도 함께 고치세요. 양쪽 주석에 적어뒀습니다.
