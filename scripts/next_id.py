#!/usr/bin/env python3
"""다음 카드 번호를 알려준다.

"내 다음 번호가 몇 번이지?"를 사람이 세지 않게 한다.
자기 대역 안에서 이미 쓴 마지막 번호를 찾아 +1 한다.
대역이 사람마다 분리돼 있으므로 4명이 동시에 발급해도 겹치지 않는다.

사용법
  python3 scripts/next_id.py O 팀원3      ->  O-401
  python3 scripts/next_id.py E 팀장       ->  E-101
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cards import (  # noqa: E402
    BANDS, BAND_EXEMPT_TYPES, EVIDENCE_DIR, card_num, card_type, load_cards,
)


def main(argv):
    if len(argv) != 2:
        print("사용법: python3 scripts/next_id.py <종류 O|E|S|C> <이름 팀장|팀원1|팀원2|팀원3>")
        return 2

    t, author = argv[0].upper(), argv[1].strip()

    if t in BAND_EXEMPT_TYPES:
        print(f"{t} 카드는 대역이 없습니다. 회의에서 001부터 순번으로 발급합니다.")
        return 2
    if t not in EVIDENCE_DIR:
        print(f"모르는 카드 종류입니다: {t} (O, E, S, C 중 하나)")
        return 2
    if author not in BANDS:
        print(f"모르는 이름입니다: {author} ({', '.join(BANDS)} 중 하나)")
        return 2

    band = BANDS[author]
    lo, hi = band * 100, band * 100 + 99

    used = [
        card_num(c["id"])
        for c in load_cards(["01_evidence"])
        if card_type(c["id"]) == t and lo <= (card_num(c["id"]) or -1) <= hi
    ]
    nxt = (max(used) + 1) if used else lo + 1

    if nxt > hi:
        print(f"{author}의 {t} 대역({lo}~{hi})이 가득 찼습니다. 팀장에게 알리세요.")
        return 1

    print(f"{t}-{nxt}")
    print(f"  파일 위치: {EVIDENCE_DIR[t]}/{t}-{nxt}.md", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
