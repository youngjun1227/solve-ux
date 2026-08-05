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
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
# 카드 상수·읽기는 전부 cards.py 에 있다. 여기에 복제하지 않는다.
from cards import (  # noqa: E402
    ROOT, ID_RE, BANDS, BAND_EXEMPT_TYPES, CAPTURE_FIELD, CAPTURE_SUFFIXES,
    CAPTURE_HOME, CARD_HOME, COMMON_FIELDS, DROPPED_STATUS, EVIDENCE_TYPES,
    EXTRA_FIELDS, GATE_COMMAND, GATE_RECORD, GRADED_TYPES, OPINION_VALUES,
    FIELD_HINT, TYPE_CHECK_NUM, card_type, load_cards,
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
        # 버린 카드는 내용을 더 볼 이유가 없다. 지우는 대신 남겨둔 것이므로
        # 지적이 계속 쌓이면 사람이 결국 파일을 지우게 된다 — 그게 더 나쁘다.
        dropped = str(fm.get("status", "")).strip().lower() in DROPPED_STATUS

        if cid in seen:
            f.append((ERROR, 8, p, f"ID 중복: {cid} (앞서 {seen[cid]} 에 있음)"))
        else:
            seen[cid] = p
        by_id[cid] = c

        # 12 — 공통 필수 필드. summary 가 없으면 카드가 수백 장 됐을 때
        # 목록만 보고는 무슨 내용인지 알 수 없다.
        if dropped:
            continue

        missing = [k for k in COMMON_FIELDS if k != "id" and not fm.get(k)]
        if missing:
            f.append((lvl, 12, p, f"공통 필수 필드 누락: {', '.join(missing)}"))

        # 종류별 필수 필드. 목록은 cards.py 의 EXTRA_FIELDS 가 정본이며
        # 여기에 다시 적지 않는다. 검사 번호는 TYPE_CHECK_NUM 을 따른다.
        extra = [k for k in EXTRA_FIELDS.get(t, []) if not fm.get(k)]
        if t == "E" and not (fm.get("url") or fm.get("local_file")):
            extra.append("url 또는 local_file")
        if extra:
            f.append((
                lvl, TYPE_CHECK_NUM.get(t, 12), p,
                f"{t} 카드 필수 필드 누락: {', '.join(extra)}{FIELD_HINT.get(t, '')}",
            ))

        # 14 — X 카드 answer_type 은 fact 또는 opinion 이어야 한다.
        # 이 값이 애매하면 의견을 근거로 쓰는 것을 막을 수 없다.
        if t == "X":
            at = str(fm.get("answer_type", "")).strip().lower()
            if at and at not in {"fact", "사실"} | OPINION_VALUES:
                f.append((lvl, 14, p, f"answer_type 값이 fact/opinion 이 아닙니다: {at}"))
            cf = str(fm.get("confidential", "")).strip().lower()
            if cf and cf not in {"yes", "no", "y", "n", "true", "false"}:
                f.append((lvl, 14, p, f"confidential 값이 yes/no 가 아닙니다: {cf}"))

        # 16 — 카드가 정해진 폴더 밖에 있다.
        # P·M 은 /gate1·/gate2 로만 만들어진다는 규칙이 폴더로 나타난다.
        # 폴더만 옮겨 만든 카드가 조용히 통과하면 게이트가 무의미해진다.
        home = CARD_HOME.get(t)
        if home:
            parent = str(Path(p).parent).replace("\\", "/")
            if parent not in home:
                f.append((
                    ERROR, 16, p,
                    f"{t} 카드는 {' 또는 '.join(home)}/ 에 있어야 합니다"
                    f" (현재: {parent}/){FIELD_HINT.get(t, '')}",
                ))

        # 17 — 캡처 파일이 실제로 있는가. 형식이 읽을 수 있는가.
        # 경로 오타나 HEIC 는 사람이 카드를 볼 때까지 드러나지 않는다.
        cap_key = CAPTURE_FIELD.get(t)
        if cap_key and fm.get(cap_key):
            cap = str(fm[cap_key]).strip()
            if not cap.startswith(CAPTURE_HOME):
                f.append((
                    lvl, 17, p,
                    f"캡처는 {CAPTURE_HOME} 안에 두어야 합니다 (현재: {cap})",
                ))
            elif not (ROOT / cap).exists():
                f.append((lvl, 17, p, f"{cap_key} 가 가리키는 파일이 없습니다: {cap}"))
            elif not cap.lower().endswith(CAPTURE_SUFFIXES):
                f.append((
                    lvl, 17, p,
                    f"캡처 형식이 PNG/JPG 가 아닙니다: {cap}"
                    " — HEIC 등은 열 수 없습니다",
                ))

        # 7 — 근거 등급 D. grade 를 갖는 종류 전부에 적용한다(CLAUDE.md 규칙 6).
        # 예전에는 C 카드만 봤다. E 카드도 grade 를 필수로 요구하므로
        # 같은 규칙이 적용되지 않으면 D 등급 외부 자료가 조용히 통과한다.
        if t in GRADED_TYPES and str(fm.get("grade", "")).upper() == "D":
            f.append((WARN, 7, p, f"{t} 카드 근거 등급 D — 카드를 만들지 않는 것이 원칙입니다"))

        # 2 — H 카드 source_types 2종 이상
        if t == "H":
            st = fm.get("source_types") or []
            if len(set(st)) < 2:
                f.append((lvl, 2, p, f"source_types가 {len(set(st))}종뿐입니다 (2종 이상 필요)"))
            # validated_by 는 초안에서는 비어 있는 것이 정상이다.
            # 회의를 통과해 draft/ 밖으로 나온 카드에는 반드시 있어야 한다.
            if not c["is_draft"] and not fm.get("validated_by"):
                f.append((
                    ERROR, 2, p,
                    "확정된 가설인데 validated_by 가 비어 있습니다"
                    " — 어느 회의에서 확정했는지 적으세요",
                ))

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

    # 18 — P·M 카드가 게이트 기록에 있는가.
    # 폴더는 게이트가 아니다. 형식이 완벽한 P 카드를 04_painpoint/ 에 손으로 두면
    # 다른 검사는 전부 통과한다. 게이트를 거쳤다는 증거는 회의 기록뿐이다.
    for gtype, rec in GATE_RECORD.items():
        ids = [c["id"] for c in cards if card_type(c["id"]) == gtype]
        if not ids:
            continue
        rec_path = ROOT / rec
        if not rec_path.exists():
            for c in cards:
                if card_type(c["id"]) == gtype:
                    f.append((
                        ERROR, 18, c["path"],
                        f"{rec} 가 없습니다 — {GATE_COMMAND[gtype]} 을 거치지 않고"
                        f" 만들어진 {gtype} 카드입니다",
                    ))
            continue
        body = rec_path.read_text(encoding="utf-8", errors="replace")
        for c in cards:
            cid = c["id"]
            if card_type(cid) != gtype:
                continue
            if not re.search(rf"\b{re.escape(cid)}\b", body):
                f.append((
                    ERROR, 18, c["path"],
                    f"{cid} 가 {rec} 에 없습니다 — {GATE_COMMAND[gtype]} 을 거쳤다면"
                    f" 기록에 ID 가 남아 있어야 합니다",
                ))

    # 15 — 멘토 의견(answer_type: opinion)을 가설·개선안의 근거로 인용
    # 멘토는 사용자가 아니다. 의견은 참고 대상이며 Research Rule 9·10 이 우선한다.
    opinion_ids = {
        c["id"] for c in cards
        if card_type(c["id"]) == "X"
        and str(c["fm"].get("answer_type", "")).strip().lower() in OPINION_VALUES
    }
    for c in cards:
        if card_type(c["id"]) not in ("H", "SOL"):
            continue
        v = c["fm"].get("evidence")
        for ref in v if isinstance(v, list) else ([v] if v else []):
            if str(ref).strip() in opinion_ids:
                f.append((
                    ERROR, 15, c["path"],
                    f"{str(ref).strip()} 는 멘토 의견(opinion)이라 근거로 쓸 수 없습니다"
                    " — 참고로만 쓰고 사용자 조사로 확인하세요",
                ))

    # 6 — 어떤 H에도 인용되지 않은 근거 카드
    for c in cards:
        if card_type(c["id"]) in EVIDENCE_TYPES and c["id"] not in cited:
            f.append((WARN, 6, c["path"], f"{c['id']} 를 인용하는 가설이 없습니다 (고아 카드)"))

    return f


NAMES = {
    1: "존재하지 않는 ID 인용", 2: "H 카드 스키마·source_types", 3: "P 카드 스키마",
    4: "SOL pain_point 누락", 5: "E 출처 4요소", 6: "고아 근거 카드",
    7: "근거 등급 D", 8: "ID 중복·형식", 9: "ID 대역 위반", 10: "M 카드 스키마",
    11: "S 카드 스키마", 12: "공통 필수 필드", 13: "C 카드 스키마",
    14: "X 카드 스키마", 15: "멘토 의견을 근거로 사용",
    16: "카드 위치 위반", 17: "캡처 파일 없음·형식 오류",
    18: "게이트 기록에 없는 P·M 카드",
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
