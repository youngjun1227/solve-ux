#!/usr/bin/env python3
"""추적성 기계 검사 — 참/거짓이 기계적으로 갈리는 것만 본다.

이 스크립트가 보지 않는 것:
  유도질문, 단정 표현, 근거의 설득력 — 판단이 필요한 것은 전부 red-team-auditor
  (/redteam) 소관이다. 둘을 섞으면 "검사 통과"의 의미가 흐려진다.

사용법
  python3 scripts/traceability_check.py           # _meta/traceability.md 에 기록
  python3 scripts/traceability_check.py --save    # 날짜 붙은 사본도 남긴다(발표 부록용)

종료 코드: ERROR 1건 이상이면 1, 아니면 0.
카드가 한 장도 없어도 에러 없이 돌아간다.
"""
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
# 카드 상수·읽기는 전부 cards.py 에 있다. 여기에 복제하지 않는다.
from cards import (  # noqa: E402
    ROOT, ID_RE, BANDS, BAND_EXEMPT_TYPES, card_type, load_cards,
)

ERROR, WARN = "ERROR", "WARN"


def run_checks(cards):
    """(레벨, 검사번호, 카드경로, 메시지) 목록을 돌려준다."""
    f = []
    by_id = {}
    seen = {}

    for c in cards:
        cid, fm, p = c["id"], c["fm"], c["path"]
        # 초안은 아직 회의를 통과하지 않았으므로 지적을 WARN으로 낮춘다.
        lvl = WARN if c["is_draft"] else ERROR
        t = card_type(cid)

        if t is None:
            f.append((ERROR, 8, p, f"ID 형식이 규칙에 없습니다: {cid}"))
            continue
        if cid in seen:
            f.append((ERROR, 8, p, f"ID 중복: {cid} (앞서 {seen[cid]} 에 있음)"))
        else:
            seen[cid] = p
        by_id[cid] = c

        # 5 — E 카드 출처 4요소
        if t == "E":
            missing = [k for k in ("source_org", "published", "page") if not fm.get(k)]
            if not (fm.get("url") or fm.get("local_file")):
                missing.append("url 또는 local_file")
            if missing:
                f.append((ERROR, 5, p, f"출처 4요소 누락: {', '.join(missing)}"))

        # 11 — S 카드 스키마
        # screen 이 비면 어느 화면을 본 것인지 추적할 수 없어 카드가 무의미해진다.
        # captured 가 없으면 앱 업데이트 전후를 구분할 수 없다.
        if t == "S":
            for k in ("screen", "captured"):
                if not fm.get(k):
                    f.append((ERROR, 11, p, f"S 카드 필수 필드 누락: {k}"))

        # 7 — 근거 등급 D
        if t == "C" and str(fm.get("grade", "")).upper() == "D":
            f.append((WARN, 7, p, "근거 등급 D — 카드를 만들지 않는 것이 원칙입니다"))

        # 2 — H 카드 source_types 2종 이상
        if t == "H":
            st = fm.get("source_types") or []
            if len(set(st)) < 2:
                f.append((lvl, 2, p, f"source_types가 {len(set(st))}종뿐입니다 (2종 이상 필요)"))

        # 3 — P 카드 스키마
        if t == "P":
            for k in ("hypothesis", "survey_q", "n", "rate"):
                if not fm.get(k):
                    f.append((ERROR, 3, p, f"P 카드 필수 필드 누락: {k} — /gate1로만 생성하세요"))
            if not fm.get("gate"):
                f.append((ERROR, 3, p, "gate 필드 없음 — /gate1을 거치지 않고 만들어진 카드로 보입니다"))

        # 4 — SOL 카드 pain_point
        if t == "SOL" and not fm.get("pain_point"):
            f.append((ERROR, 4, p, "pain_point 없음 — 개선안은 P 카드에 연결되어야 합니다"))

        # 10 — M 카드 스키마 (뿌리 ① — 추적성이 SOL에서 끊기지 않게)
        if t == "M":
            for k in ("solution", "pain_point", "metric", "baseline", "result"):
                if not fm.get(k):
                    f.append((ERROR, 10, p, f"M 카드 필수 필드 누락: {k} — /gate2로만 생성하세요"))

        # 9 — ID 대역 (H·P·M 제외)
        if t not in BAND_EXEMPT_TYPES:
            num = int(ID_RE.match(cid).group(2))
            band = BANDS.get(str(fm.get("author", "")).strip())
            if band and num // 100 != band:
                f.append(
                    (WARN, 9, p, f"{fm['author']}의 대역은 {band}00번대인데 {cid} 입니다")
                )

    # 1 — 존재하지 않는 ID 인용
    cited = set()
    for c in cards:
        for key in ("evidence", "hypothesis", "pain_point", "solution"):
            v = c["fm"].get(key)
            for ref in v if isinstance(v, list) else ([v] if v else []):
                ref = str(ref).strip()
                if not ID_RE.match(ref):
                    continue
                cited.add(ref)
                if ref not in by_id:
                    f.append((ERROR, 1, c["path"], f"존재하지 않는 ID를 인용: {ref}"))

    # 6 — 어떤 H에도 인용되지 않은 근거 카드
    for c in cards:
        if card_type(c["id"]) in ("O", "E", "S", "C") and c["id"] not in cited:
            f.append((WARN, 6, c["path"], f"{c['id']} 를 인용하는 가설이 없습니다 (고아 카드)"))

    return f


NAMES = {
    1: "존재하지 않는 ID 인용", 2: "H source_types 1종", 3: "P 카드 스키마",
    4: "SOL pain_point 누락", 5: "E 출처 4요소", 6: "고아 근거 카드",
    7: "근거 등급 D", 8: "ID 중복·형식", 9: "ID 대역 위반", 10: "M 카드 스키마",
    11: "S 카드 스키마",
}


def report(cards, findings):
    errs = [x for x in findings if x[0] == ERROR]
    warns = [x for x in findings if x[0] == WARN]
    L = [
        "# 추적성 검사 결과",
        "",
        f"실행일: {date.today()}  ·  카드 {len(cards)}장  ·  ERROR {len(errs)} / WARN {len(warns)}",
        "",
    ]
    if not cards:
        L += ["아직 카드가 없습니다. 카드가 생기면 여기에 결과가 쌓입니다.", ""]
    if not findings:
        L += ["✅ 지적 사항 없음.", ""]
    for level, group in ((ERROR, errs), (WARN, warns)):
        if not group:
            continue
        L += [f"## {level} ({len(group)}건)", ""]
        for _, num, path, msg in sorted(group, key=lambda x: (x[1], x[2])):
            L += [f"- **#{num} {NAMES.get(num, '')}** · `{path}`", f"  - {msg}"]
        L += [""]
    L += [
        "---",
        "",
        "이 검사는 기계적으로 참/거짓이 갈리는 것만 봅니다.",
        "유도질문·단정 표현 등 판단이 필요한 것은 `/redteam`이 담당합니다.",
        "",
    ]
    return "\n".join(L)


def main(argv):
    cards = load_cards()
    findings = run_checks(cards)
    text = report(cards, findings)

    meta = ROOT / "_meta"
    meta.mkdir(exist_ok=True)
    (meta / "traceability.md").write_text(text, encoding="utf-8")
    saved = None
    if "--save" in argv:
        # 커밋되는 사본. _meta/traceability.md 는 .gitignore 대상이라
        # 발표 부록으로 쓰려면 날짜가 붙은 이 파일이 필요하다.
        saved = meta / f"traceability_{date.today()}.md"
        saved.write_text(text, encoding="utf-8")

    errs = sum(1 for x in findings if x[0] == ERROR)
    warns = len(findings) - errs
    print(f"[추적성 검사] 카드 {len(cards)}장 — ERROR {errs} / WARN {warns}")
    print(f"  리포트: _meta/traceability.md" + (f"\n  사본:   {saved.relative_to(ROOT)}" if saved else ""))
    if errs:
        print("\n❌ ERROR가 있습니다. Gate를 통과할 수 없습니다.")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
