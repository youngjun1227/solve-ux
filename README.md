# 신한 슈퍼SOL 앱 내 보험 Tab 사용자 경험(UX) 개선 프로젝트

- 팀명: **SOL:VE** (대학생 4인)
- 대상기업: **신한라이프**
- 기간: 2026-08-05 ~ 2026-09-20

신한 슈퍼SOL 앱의 보험 Tab을 직접 써 보고, 근거를 모아 문제를 검증하고,
개선안을 만들어 테스트까지 합니다.

- 전체 계획: [00_project/PROJECT_PLAN.md](00_project/PROJECT_PLAN.md)
- 처음이라면: [00_project/START_HERE.md](00_project/START_HERE.md)부터

## 이 저장소가 돌아가는 방식

주장 하나마다 근거 카드 한 장을 남깁니다. 카드가 쌓이면 가설(H)을 세우고,
설문으로 검증해 Pain Point(P)를 확정하고, 그에 연결된 개선안(SOL)을 만들어
테스트 결과(M)로 판단합니다. **근거 → 가설 → 검증 → 개선 → 측정**의 연결이
끊기지 않는 것이 이 프로젝트의 뼈대입니다.

| 카드 | 무엇 | 어디에 |
|---|---|---|
| O | 팀이 직접 써 보고 관찰한 것 | `01_evidence/team/` |
| E | 외부 자료 (보고서·법령·통계) | `01_evidence/desk/` |
| S | SuperSOL 화면 분석 | `01_evidence/screen/` |
| C | 경쟁 앱 (모니모·토스) 분석 | `01_evidence/competitor/` |
| X | 멘토에게 확인받은 답 | `01_evidence/expert/` |
| H → P → SOL → M | 가설 → 검증된 문제 → 개선안 → 측정 | `02_hypothesis/` 이후 폴더들 |

지켜야 할 규칙(사실과 해석의 분리, 검증 전 단정 금지 등)은
[CLAUDE.md](CLAUDE.md)에 있습니다. Claude Code가 이 규칙을 알고 함께 일합니다.

## 매일 하는 것 두 가지

```
/start   ← 작업 시작할 때: 팀원들 작업 받아오기 + 뭐가 바뀌었는지 요약
/save    ← 작업 끝났을 때: 내가 만든 카드를 올리기
```

카드 작성, 자료 조사, 검사 같은 일은 Claude Code에게 말로 시키면 됩니다.
자주 쓰는 말은 [00_project/PROMPT_GUIDE.md](00_project/PROMPT_GUIDE.md) 참고.

## 카드 구경하기 (뷰어)

만든 카드를 종류별로 보고 검색하는 화면이 있습니다. Claude Code에서

```
/viewer
```

라고 치면 알아서 켜집니다. 브라우저에서 http://localhost:5173 으로 보세요
(끌 때는 "뷰어 꺼줘"). **각자 자기 컴퓨터에서 켜서 자기 브라우저로 봅니다** —
누가 대신 켜 줄 필요도, 같은 와이파이일 필요도 없습니다.

처음 한 번은 준비 설치가 돌아가고(1~2분), Node가 없으면 설치 안내가 나옵니다.
터미널로 직접 켜는 법은 [viewer/README.md](viewer/README.md) 참고.

## 폴더 한눈에

```
00_project/     계획서, 안내 문서, 경쟁 앱 평가지
01_evidence/    근거 카드 전부 (team/desk/screen/competitor/expert) + 캡처(screens/)
02_hypothesis/  가설 (draft/는 회의 확정 전 초안)
03_validation/  설문 (raw/는 커밋 금지 — 개인정보)
04_painpoint/   검증된 Pain Point (Gate 1 통과분만)
05_solution/    개선안
06_prototype/   Figma·React 프로토타입
07_usertest/    사용자 테스트 (raw/는 커밋 금지)
08_deliverable/ 발표 자료
_meta/          회의 기록, 결정 로그, 자료 위시리스트, 멘토 질문
scripts/        번호 발급, 목록 생성, 커밋 경로 검사
```

## 조심할 것

- 설문 응답 원본, 연락처, 녹화 파일은 **절대 커밋하지 않습니다.**
  커밋 전 경로 검사가 자동으로 막아 주지만, 애초에 `raw/` 밖에 두지 마세요.
- 카드는 지우지 않습니다. 틀렸으면 내용을 고치거나 status만 바꿉니다.
- 캡처는 PNG/JPG만. 아이폰은 촬영 전 카메라 설정을 "높은 호환성"으로.
