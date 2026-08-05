#!/usr/bin/env python3
"""커밋 대상 경로를 화이트리스트와 대조하고, 올라가지 않는 파일을 알려준다.

판정 기준은 전부 scripts/paths.py 에 있다. 이 파일은 실행 껍데기일 뿐이며
판정 로직을 여기에 복제하지 않는다.

사용법
  python3 scripts/check_commit_paths.py              # staged 파일 검사
  python3 scripts/check_commit_paths.py --all        # 추적 중인 전체 파일 검사
  python3 scripts/check_commit_paths.py 경로 [경로…]  # 지정 경로 검사

종료 코드
  0  이상 없음
  1  커밋하면 안 되는 파일이 있다 — 멈춰야 한다
  2  올라가지 않는 파일이 있다 — 사람에게 확인을 받아야 한다

--all 이 필요한 이유:
  .gitignore 는 이미 추적 중인 파일을 막지 못한다. 한 번 추적 상태가 된
  파일은 이후 .gitignore 에 넣어도 계속 커밋된다. --all 은 그렇게
  들어와 버린 파일을 찾아낸다.

--all 이 아직 추적되지 않은 새 파일까지 보는 이유:
  .gitignore 는 paths.py 의 수동 사본이라 규칙이 어긋날 수 있다. 실제로
  paths.py 는 파일명에 '연락처'가 들어가면 어디에 있든 차단하지만,
  .gitignore 의 `**/연락처*` 는 이름이 그 글자로 시작할 때만 걸린다.
  그래서 '참가자연락처.md' 는 무시되지도 않고 추적되지도 않은 상태가 되어,
  추적 파일만 보면 검사를 그냥 통과한다. 그다음 /save 의 git add 가 그대로
  스테이징한다. 커밋 히스토리는 되돌릴 수 없으므로 여기서 잡아야 한다.
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paths import EXPECTED, check, explain_ignored  # noqa: E402


def git_z(*args):
    """git 출력을 -z(NUL 구분)로 읽는다.

    -z 를 쓰지 않으면 git 이 core.quotepath 설정에 따라 한글·공백·특수문자
    경로를 "\\354\\235\\270..." 처럼 이스케이프해서 내보낸다. 그러면 앞의 큰따옴표
    때문에 경로 판정이 통째로 빗나가 한글 파일명이 검사를 그냥 통과한다.
    core.quotepath 는 PC마다 다르므로 설정에 기대지 않고 -z 로 고정한다.
    """
    out = subprocess.run(
        ["git", *args], capture_output=True, text=True, check=True
    ).stdout
    return [x for x in out.split("\0") if x.strip()]


def ignored_files():
    """저장소에 올라가지 않는 파일 목록 (추적 안 되고 무시되는 것)."""
    return git_z("ls-files", "-z", "--others", "--ignored", "--exclude-standard")


def main(argv):
    if "--all" in argv:
        # 추적 중인 파일 + 아직 추적되지 않은 새 파일(무시되는 것은 제외).
        # 새 파일을 빼면 위 주석의 구멍이 생긴다. 무시되는 파일은 어차피
        # 커밋되지 않으므로 explain_ignored 쪽에서 따로 안내한다.
        tracked = git_z("ls-files", "-z")
        untracked = git_z("ls-files", "-z", "--others", "--exclude-standard")
        targets = tracked + untracked
        label = "추적 중인 파일 + 새 파일"
        show_ignored = True
    elif argv:
        targets = argv
        label = "지정한 경로"
        show_ignored = False
    else:
        # --diff-filter=d 로 삭제를 뺀다. 삭제되는 파일은 커밋되는 것이 아니라
        # 저장소에서 빠지는 것이므로 차단 대상이 아니다. 이걸 빼지 않으면
        # __pycache__ 를 지우는 커밋이 "커밋하면 안 되는 파일"로 잡힌다.
        targets = git_z("diff", "--cached", "--name-only", "-z", "--diff-filter=d")
        label = "staged 파일"
        show_ignored = True

    blocked, allowed = check(targets)

    print(f"[경로 검사] {label} {len(targets)}건 — 허용 {len(allowed)} / 차단 {len(blocked)}")

    if blocked:
        print("\n❌ 커밋하면 안 되는 파일이 있습니다.\n")
        for path, reason in blocked:
            print(f"  {path}\n      → {reason}")
        print(
            "\n조치:\n"
            "  1) 아직 add 안 했다면 그대로 두세요.\n"
            "  2) 이미 staged 라면  git restore --staged <파일>\n"
            "  3) 이미 이전 커밋에 들어가 추적 중이라면  git rm --cached <파일>\n"
            "     (.gitignore 만으로는 추적 중인 파일이 막히지 않습니다)\n"
            "  4) 판단이 안 서면 팀장에게 물어보세요. 혼자 해결하려 하지 마세요."
        )
        return 1

    # 올라가지 않는 파일 안내.
    # "차단 대상 없음"만 말하면 사람은 자기 파일이 저장된 줄 안다.
    expected, mistakes = [], []
    if show_ignored:
        for path in ignored_files():
            kind, why, where = explain_ignored(path)
            (expected if kind == EXPECTED else mistakes).append((path, why, where))

    if expected:
        print(f"\n올라가지 않는 파일 {len(expected)}건 — 원래 그런 것이니 괜찮습니다.")
        for path, why, _ in expected:
            print(f"  {path}\n      {why}")

    if mistakes:
        print(f"\n⚠️  이 파일은 저장소에 올라가지 않습니다. {len(mistakes)}건")
        for path, why, where in mistakes:
            print(f"\n  {path}")
            print(f"      {why}")
            if where:
                print(f"      올릴 수 있는 곳: {where}")
            print("      이대로 두면 다른 팀원은 이 파일을 볼 수 없습니다.")
        print("\n  → 위치를 옮기시겠습니까? 옮길 곳을 정하면 파일을 이동해 드립니다.")
        print("     원래 안 올리려던 파일이면 그대로 두셔도 됩니다.")
        return 2

    if not blocked:
        print("✅ 차단 대상 없음.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
