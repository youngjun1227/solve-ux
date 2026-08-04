"""SOL:VE 카드 공통 정의 — 단일 정의처.

카드가 무엇인지(종류·필수 필드·ID 대역·읽는 법)를 여기 한 곳에만 둔다.
traceability_check.py / build_index.py / next_id.py 가 모두 여기를 import 한다.
같은 상수를 여러 파일에 복제하지 않는다.

문서 쪽 원본은 CLAUDE.md 이고 이 파일은 그것의 실행 가능한 형태다.
둘이 어긋나면 CLAUDE.md 가 맞다.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ID_RE = re.compile(r"^(O|E|S|C|H|P|SOL|M)-(\d+)$")

# 카드가 있는 곳. 폴더가 없어도 문제없다.
CARD_DIRS = [
    "01_evidence",
    "02_hypothesis",
    "04_painpoint",
    "05_solution",
    "07_usertest/measurement",
]

# 근거 카드가 들어가는 곳 — 종류별 기본 폴더.
EVIDENCE_DIR = {
    "O": "01_evidence/team",
    "E": "01_evidence/desk",
    "S": "01_evidence/screen",
    "C": "01_evidence/competitor",
}

# ID 대역. 카드 종류와 무관하게 사람당 하나다.
# H·P·M 은 대역이 없다(회의에서만 생성) → 대역 검사 대상이 아니다.
BANDS = {"팀장": 1, "팀원1": 2, "팀원2": 3, "팀원3": 4}
BAND_EXEMPT_TYPES = {"H", "P", "M"}

# 모든 카드 공통. summary 는 한 줄 요약이며 카드가 수백 장이 됐을 때
# 이것만 모아 보게 된다.
COMMON_FIELDS = ["id", "type", "author", "date", "summary"]

# 종류별 추가 필수 필드. O 카드는 추가 필드가 없다 — 가장 단순해야 한다.
# 문서 쪽 정본은 CLAUDE.md "카드 필수 필드"다. 둘이 어긋나면 CLAUDE.md 가 맞다.
# traceability_check.py 가 이 표를 그대로 읽어 검사한다. 필드 목록을 그쪽에
# 다시 적지 않는다.
EXTRA_FIELDS = {
    "O": [],
    "E": ["source_org", "published", "page", "grade"],  # url 또는 local_file 은 별도 처리
    "S": ["screen", "captured"],
    "C": ["app", "user_task", "grade", "capture", "captured"],
    "H": ["status", "evidence", "source_types"],
    "P": ["hypothesis", "survey_q", "n", "rate", "gate"],
    "SOL": ["pain_point"],
    "M": ["solution", "pain_point", "metric", "baseline", "result", "gate"],
}

# 필드가 비었을 때 붙일 안내. 카드를 만드는 경로가 정해진 종류에만 있다.
FIELD_HINT = {
    "P": " — /gate1로만 생성하세요",
    "M": " — /gate2로만 생성하세요",
}

# 검사 번호 — 종류별 필수 필드 누락을 어느 번호로 보고할지.
# 번호의 의미는 SETUP.md 7절 표와 같아야 한다.
TYPE_CHECK_NUM = {"E": 5, "S": 11, "C": 13, "H": 2, "P": 3, "SOL": 4, "M": 10}

# 본문 구조 — "사실"과 "해석"을 반드시 나눈다.
# PROJECT_PLAN 핵심 원칙("우리 생각 ≠ 사용자의 불편")이 카드 단위로 내려오는 지점이다.
BODY_SECTIONS = {
    "O": ("## 사실 (내가 실제로 본 것)", "## 내 해석 (내 생각)"),
    "E": ("## 사실 (자료에 적힌 그대로)", "## 내 해석 (내 생각)"),
    "S": ("## 화면에서 확인되는 사실", "## UX 관점 해석 (아직 문제 아님)"),
    "C": ("## 화면에서 확인되는 사실", "## 비교 관점 해석 (아직 문제 아님)"),
}

TYPE_NAME = {
    "O": "팀 관찰", "E": "외부 자료", "S": "화면 분석", "C": "경쟁 앱",
    "H": "가설", "P": "검증된 문제", "SOL": "개선안", "M": "측정 결과",
}


def parse_front_matter(text):
    """--- 로 감싼 앞부분만 아주 단순하게 파싱한다. 외부 라이브러리를 쓰지 않는다."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    data = {}
    for line in text[3:end].splitlines():
        line = line.split("#")[0].rstrip()
        if not line.strip() or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip(), val.strip()
        if val.startswith("[") and val.endswith("]"):
            items = [v.strip().strip("'\"") for v in val[1:-1].split(",")]
            data[key] = [v for v in items if v]
        else:
            v = val.strip("'\"")
            data[key] = None if v in ("", "null", "~") else v
    return data


def card_type(cid):
    m = ID_RE.match(str(cid))
    return m.group(1) if m else None


def card_num(cid):
    m = ID_RE.match(str(cid))
    return int(m.group(2)) if m else None


def load_cards(dirs=None):
    """카드를 전부 읽는다. 한 장도 없으면 빈 목록을 돌려준다(에러 아님)."""
    cards = []
    for d in dirs or CARD_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for path in sorted(base.rglob("*.md")):
            fm = parse_front_matter(path.read_text(encoding="utf-8"))
            if not fm.get("id"):
                continue
            cards.append(
                {
                    "fm": fm,
                    "id": str(fm["id"]),
                    "path": path.relative_to(ROOT).as_posix(),
                    "is_draft": "02_hypothesis/draft/" in path.as_posix(),
                }
            )
    return cards
