#!/usr/bin/env python3
"""커밋 대상 경로를 화이트리스트와 대조한다.

판정 기준은 전부 scripts/paths.py 에 있다. 이 파일은 실행 껍데기일 뿐이며
판정 로직을 여기에 복제하지 않는다.

사용법
  python3 scripts/check_commit_paths.py              # staged 파일 검사
  python3 scripts/check_commit_paths.py --all        # 추적 중인 전체 파일 검사
  python3 scripts/check_commit_paths.py 경로 [경로…]  # 지정 경로 검사

종료 코드: 차단 대상이 하나라도 있으면 1, 없으면 0.

--all 이 필요한 이유:
  .gitignore 는 이미 추적 중인 파일을 막지 못한다. 한 번 추적 상태가 된
  파일은 이후 .gitignore 에 넣어도 계속 커밋된다. --all 은 그렇게
  들어와 버린 파일을 찾아낸다.
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paths import check  # noqa: E402


def git(*args):
    out = subprocess.run(
        ["git", *args], capture_output=True, text=True, check=True
    ).stdout
    return [line for line in out.splitlines() if line.strip()]


def main(argv):
    if "--all" in argv:
        targets = git("ls-files")
        label = "추적 중인 전체 파일"
    elif argv:
        targets = argv
        label = "지정한 경로"
    else:
        # --diff-filter=d 로 삭제를 뺀다. 삭제되는 파일은 커밋되는 것이 아니라
        # 저장소에서 빠지는 것이므로 차단 대상이 아니다. 이걸 빼지 않으면
        # __pycache__ 를 지우는 커밋이 "커밋하면 안 되는 파일"로 잡힌다.
        targets = git("diff", "--cached", "--name-only", "--diff-filter=d")
        label = "staged 파일"

    if not targets:
        print(f"검사할 {label}이 없습니다.")
        return 0

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

    print("✅ 차단 대상 없음.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
