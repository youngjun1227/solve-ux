#!/usr/bin/env python3
"""근거 카드 목록(index.csv)을 다시 만든다.

index.csv 는 소스가 아니라 생성물이다. 4명이 같은 CSV 끝에 줄을 추가하면
100% 충돌하므로 저장소에 올리지 않고 매번 여기서 다시 만든다.
(.gitignore / scripts/paths.py 의 GENERATED 참고)

사용법
  python3 scripts/build_index.py

카드가 한 장도 없어도 에러 없이 돌아간다. 헤더만 있는 파일이 만들어진다.
"""
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cards import ROOT, card_num, card_type, load_cards  # noqa: E402

OUT = ROOT / "01_evidence" / "index.csv"
COLUMNS = ["id", "type", "author", "date", "source_org", "grade", "file_path", "summary"]


def main():
    cards = [c for c in load_cards(["01_evidence"]) if card_type(c["id"])]
    cards.sort(key=lambda c: (card_type(c["id"]), card_num(c["id"]) or 0))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(COLUMNS)
        for c in cards:
            fm = c["fm"]
            w.writerow(
                [
                    c["id"],
                    fm.get("type", ""),
                    fm.get("author", ""),
                    fm.get("date", ""),
                    fm.get("source_org", ""),
                    fm.get("grade", ""),
                    c["path"],
                    fm.get("summary", ""),
                ]
            )

    if not cards:
        print("카드가 아직 없습니다. 빈 목록을 만들었습니다. (01_evidence/index.csv)")
    else:
        by_type = {}
        for c in cards:
            by_type[card_type(c["id"])] = by_type.get(card_type(c["id"]), 0) + 1
        breakdown = " / ".join(f"{t} {n}장" for t, n in sorted(by_type.items()))
        print(f"카드 목록을 다시 만들었습니다 — 총 {len(cards)}장 ({breakdown})")
        missing = [c["id"] for c in cards if not c["fm"].get("summary")]
        if missing:
            print(f"  ⚠️ summary가 없는 카드: {', '.join(missing)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
