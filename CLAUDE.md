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

## 카드 승격 경로 (전역 규칙)

승격은 전부 회의의 산출물이다. Claude가 스스로 판단해 승격시키지 않는다.

- H 카드 초안은 02_hypothesis/draft/에 둔다.
  8/17 종합 회의에서 팀이 확정한 것만 02_hypothesis/로 승격된다.
- **P 카드는 /gate1 커맨드로만 생성한다.** 04_painpoint/에만 존재한다.
  다른 경로로 만들어진 P 카드는 규칙 위반이며 검사에서 ERROR로 잡는다.
- **M 카드는 /gate2 커맨드로만 생성한다.** 07_usertest/measurement/에만 존재한다.
  다른 경로로 만들어진 M 카드는 규칙 위반이며 검사에서 ERROR로 잡는다.
- Gate 통과 기준은 00_project/PROJECT_PLAN.md의 Gate 체크리스트가 원본이다.
  커맨드는 그것을 읽어 제시할 뿐, 별도 기준을 만들지 않는다.
- Gate를 통과하지 못하면 카드를 만들지 않고 status도 올리지 않는다.

## 카드 필수 필드

모든 카드는 YAML front-matter로 시작한다.

- 공통: id, type, author, date, summary (summary는 한 줄)
- E 카드: source_org, published, url 또는 local_file, page, grade
- C 카드: app, user_task, grade, capture (파일 경로), captured (캡처한 날짜)
  → 경쟁 앱은 발표 전에 업데이트된다. 언제 찍은 화면인지가 없으면 근거로 쓸 수 없다
- S 카드: screen (캡처 경로), captured (캡처한 날짜)
  → 앱은 업데이트되므로 언제 찍은 화면인지가 없으면 근거로 쓸 수 없다

## 캡처 파일

- 캡처 이미지는 종류와 무관하게 **01_evidence/screens/ 한 곳에** 둔다.
  01_evidence/screen/ 은 S 카드가 들어가는 곳이며 이미지 폴더가 아니다.
- 파일명에 반드시 촬영 날짜를 넣는다. 재촬영 시 앞의 파일을 덮어쓰지 않게 한다.
  SuperSOL: supersol_{화면이름}_{YYYYMMDD}.png
  경쟁 앱:  {앱}_{T##}_{step##}_{YYYYMMDD}.png
- 형식은 PNG 또는 JPG만 쓴다. **HEIC는 읽을 수 없다.**
  아이폰 기본 설정이 HEIC이므로 촬영 전에 확인이 필요하다.
- 캡처는 저장소에 파일로 있어야 한다. 채팅에 붙여넣은 이미지는
  카드의 screen·capture 필드에 적을 경로가 없어 카드를 만들 수 없다.
- H 카드: status, evidence[], source_types[], validated_by
  → source_types는 서로 다른 종류가 최소 2개여야 한다
- P 카드: hypothesis(H-### 필수), survey_q[], n, rate, gate
  → 하나라도 비면 카드를 만들지 않는다
- SOL 카드: pain_point (P-### 필수)
- M 카드: solution(SOL-### 필수), pain_point(P-### 필수), metric, baseline, result, gate

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

## 개인정보 — 커밋 경로 화이트리스트

- 커밋해도 되는 경로의 정의처는 scripts/paths.py 하나다.
  판정 로직을 커맨드나 다른 스크립트에 복제하지 않는다.
- 커밋 전에는 python3 scripts/check_commit_paths.py 로 대조한다.
- .gitignore는 1차 방어선일 뿐이다. **이미 추적 중인 파일은 막지 못한다.**
  실제 방어는 위 경로 검사가 한다.
- 03_validation/raw/, 07_usertest/raw/ 의 내용물과 연락처·녹화 파일은
  어떤 경우에도 커밋하지 않는다. git history는 되돌릴 수 없다.
