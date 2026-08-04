"""SOL:VE 커밋 경로 화이트리스트 — 단일 정의처.

이 파일이 "무엇을 커밋해도 되는가"의 유일한 정의처다.
/save, /gate1, /gate2, 그리고 3단계의 traceability_check.py 가 모두 여기를 참조한다.
각 커맨드에 같은 판정 로직을 복제하지 않는다.

──────────────────────────────────────────────────────────────────────
⚠️  .gitignore 는 수동 동기화 대상이다
──────────────────────────────────────────────────────────────────────
.gitignore 는 파이썬을 import 할 수 없으므로 아래 상수를 자동으로 따라가지 못한다.
RESTRICTED_ROOTS / BLOCKED_SUFFIXES / BLOCKED_NAME_SUBSTRINGS / GENERATED 를
고치면 저장소 루트 .gitignore 의 대응 블록도 **반드시 함께** 고쳐야 한다.

역할 분담이 다르다는 점도 기억할 것:
  .gitignore          = 1차 방어선. 실수로 add 되는 것을 줄인다.
                        이미 추적 중인 파일은 막지 못한다.
  이 파일 + 검사 스크립트 = 실제 방어선. 커밋 대상 경로를 직접 대조하므로
                        추적 여부와 무관하게 걸러낸다.
"""

# 개인정보가 들어올 수 있어 "차단 후 허용"으로 운영하는 폴더.
# 값에 없는 하위 폴더는 전부 커밋 금지.
RESTRICTED_ROOTS = {
    "03_validation": {"design", "anonymized", "analysis"},
    "07_usertest": {"protocol", "anonymized", "analysis", "measurement"},
}

# 위 폴더의 차단 구역에서도 유일하게 허용되는 파일.
# 폴더 자체는 저장소에 남아야 팀원이 원본을 어디 둘지 안다.
KEEPFILE = ".gitkeep"

# 카드 front-matter 에서 매번 재생성되는 산출물. 커밋하면 4명이 충돌한다.
GENERATED = {
    "01_evidence/index.csv",
    "_meta/traceability.md",
}

# 2차 방어선 — 화이트리스트 밖 폴더에 실수로 저장한 녹화·녹음.
BLOCKED_SUFFIXES = {".mp4", ".mov", ".avi", ".m4a", ".mp3", ".wav"}

# 3차 방어선 — 파일명 패턴. 이름을 바꾸면 뚫리므로 이것만 믿지 않는다.
BLOCKED_NAME_SUBSTRINGS = ("contacts", "연락처", "participants", "응답자", "개인정보")

ALLOW = "ALLOW"
BLOCK = "BLOCK"


def classify(path: str):
    """경로 하나를 판정한다. (verdict, reason) 을 돌려준다."""
    p = path.replace("\\", "/").lstrip("./")
    parts = [x for x in p.split("/") if x]
    if not parts:
        return BLOCK, "빈 경로"
    name = parts[-1]
    lower = name.lower()

    if p in GENERATED:
        return BLOCK, f"자동 생성물 — 커밋 대상이 아니다 ({p})"

    for suf in BLOCKED_SUFFIXES:
        if lower.endswith(suf):
            return BLOCK, f"녹화·녹음 파일 ({suf}) — 저장소에 두지 않는다"

    for sub in BLOCKED_NAME_SUBSTRINGS:
        if sub in lower:
            return BLOCK, f"개인정보로 보이는 파일명 패턴 ('{sub}')"

    root = parts[0]
    if root in RESTRICTED_ROOTS:
        allowed = RESTRICTED_ROOTS[root]
        if name == KEEPFILE:
            return ALLOW, "폴더 유지용 .gitkeep"
        if len(parts) < 3:
            return BLOCK, f"{root}/ 바로 아래에는 파일을 두지 않는다 — {'/'.join(sorted(allowed))} 안으로"
        if parts[1] not in allowed:
            return BLOCK, (
                f"{root}/{parts[1]}/ 는 커밋 금지 구역 — "
                f"허용: {', '.join(sorted(allowed))}"
            )
        return ALLOW, f"{root}/{parts[1]}/ 허용 구역"

    return ALLOW, "제한 구역 아님"


def check(paths):
    """여러 경로를 판정한다. (blocked, allowed) 두 리스트를 돌려준다.

    blocked/allowed 원소는 (path, reason) 튜플.
    """
    blocked, allowed = [], []
    for path in paths:
        verdict, reason = classify(path)
        (allowed if verdict == ALLOW else blocked).append((path, reason))
    return blocked, allowed
