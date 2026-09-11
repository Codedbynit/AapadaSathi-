import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

import pandas as pd

# Paths (relative to project root)
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "backend" / "data"
FEATURES_FILE = DATA_DIR / "historical_features.json"
OUTPUT_FILE = DATA_DIR / "historical_features_with_flood.json"
IFI_CSV = DATA_DIR / "India_Flood_Inventory_v3.csv"
REPORT_TXT = DATA_DIR / "validation_report.txt"
REPORT_JSON = DATA_DIR / "validation_report.json"

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def normalize_district(name: Optional[str]) -> Optional[str]:
    if not name or not isinstance(name, str):
        return None
    # Basic cleanup: lower, strip, remove surrounding quotes
    n = name.lower().strip().strip('"').strip("'")
    # Replace common abbreviations / formatting differences
    replacements = {
        "dist.": "district",
        "\u2013": "-",  # en‑dash to hyphen
        "\u2014": "-",  # em‑dash to hyphen
        ",": "",
    }
    for old, new in replacements.items():
        n = n.replace(old, new)
    # Collapse multiple spaces
    n = " ".join(n.split())
    return n

def load_historical_features(path: Path) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("historical_features.json should contain a list of records")
    return data

def load_ifi_events(csv_path: Path) -> List[Dict[str, Any]]:
    if not csv_path.is_file():
        # Attempt a simple download from a known Zenodo URL (placeholder)
        url = (
            "https://zenodo.org/record/8222108/files/India_Flood_Inventory_v3.csv?download=1"
        )
        try:
            import urllib.request
            print(f"Downloading IFI dataset from {url}...")
            urllib.request.urlretrieve(url, str(csv_path))
        except Exception as e:
            raise FileNotFoundError(f"IFI CSV not found at {csv_path} and download failed: {e}")
    df = pd.read_csv(csv_path, dtype=str)
    # Expected columns (case‑insensitive handling)
    col_map = {
        "start date": "start_date",
        "end date": "end_date",
        "district": "district",
        "state": "state",
        "district_lgd_codes": "district_lgd_codes",
        "uei": "uei",
    }
    df_columns = {c.lower(): c for c in df.columns}
    for src, tgt in col_map.items():
        if src not in df_columns:
            raise KeyError(f"Required column '{src}' not found in IFI CSV")
        df.rename(columns={df_columns[src]: tgt}, inplace=True)
    # Parse dates safely
    df["start_date"] = pd.to_datetime(df["start_date"], errors="coerce")
    df["end_date"] = pd.to_datetime(df["end_date"], errors="coerce")
    # Normalise district names
    df["norm_district"] = df["district"].apply(normalize_district)
    # Drop rows with missing critical info
    df = df.dropna(subset=["norm_district", "start_date", "end_date"])
    # Convert to list of dicts for faster lookup
    events = df.to_dict("records")
    return events

def match_events(
    district_norm: Optional[str], feature_date: datetime, events: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    if not district_norm:
        return []
    matches = []
    for ev in events:
        if ev["norm_district"] != district_norm:
            continue
        if ev["start_date"] <= feature_date <= ev["end_date"]:
            matches.append(ev)
    return matches

def generate_labels(features: List[Dict[str, Any]], events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    enriched = []
    for rec in features:
        # Extract feature date
        date_str = rec.get("date")
        try:
            feat_date = datetime.strptime(date_str, "%Y-%m-%d")
        except Exception:
            # Invalid or missing date – mark as unknown
            rec["flood_occurred"] = None
            rec["label_source"] = "unknown"
            enriched.append(rec)
            continue
        # Determine district – heuristics based on possible keys
        district_raw = (
            rec.get("district")
            or rec.get("settlement", {}).get("district")
            or rec.get("settlement_district")
        )
        district_norm = normalize_district(district_raw)
        matches = match_events(district_norm, feat_date, events)
        if district_norm is None:
            rec["flood_occurred"] = None
            rec["label_source"] = "unknown"
        elif matches:
            rec["flood_occurred"] = 1
            rec["label_source"] = "IFI"
            rec["matched_uei"] = [m.get("uei") for m in matches]
        else:
            rec["flood_occurred"] = 0
            rec["label_source"] = "IFI"
        enriched.append(rec)
    return enriched

def _is_valid_date(date_str: str) -> bool:
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except Exception:
        return False

def validate_dataset(enriched: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(enriched)
    pos = sum(1 for r in enriched if r.get("flood_occurred") == 1)
    neg = sum(1 for r in enriched if r.get("flood_occurred") == 0)
    unknown = sum(1 for r in enriched if r.get("flood_occurred") is None)
    percent_pos = (pos / total * 100) if total else 0
    # Unique settlements and districts (fallback keys)
    settlements = set()
    districts = set()
    for r in enriched:
        s = (
            r.get("settlement", {}).get("name")
            or r.get("settlement_name")
        )
        if s:
            settlements.add(s)
        d = (
            r.get("district")
            or r.get("settlement", {}).get("district")
        )
        if d:
            districts.add(normalize_district(d))
    # Matched IFI events count (unique UEI)
    matched_ueis = set()
    for r in enriched:
        for uei in r.get("matched_uei", []):
            if uei:
                matched_ueis.add(uei)
    # Date range
    dates = [datetime.strptime(r["date"], "%Y-%m-%d") for r in enriched if r.get("date")]
    date_range = (min(dates).date(), max(dates).date()) if dates else (None, None)
    # Positive date extremes
    pos_dates = [datetime.strptime(r["date"], "%Y-%m-%d") for r in enriched if r.get("flood_occurred") == 1]
    earliest_pos = min(pos_dates).date() if pos_dates else None
    latest_pos = max(pos_dates).date() if pos_dates else None
    # Data‑quality checks
    missing_dates = sum(1 for r in enriched if not r.get("date"))
    invalid_dates = sum(1 for r in enriched if r.get("date") and not _is_valid_date(r["date"]))
    duplicate_records = len(enriched) - len({json.dumps(r, sort_keys=True) for r in enriched})
    nan_values = sum(
        1
        for r in enriched
        for k, v in r.items()
        if isinstance(v, (float, int)) and pd.isna(v)
    )
    # Districts with no matches (but have records)
    districts_no_match = {
        d for d in districts if not any(
            r.get("district") and normalize_district(r.get("district")) == d and r.get("flood_occurred") == 1
            for r in enriched
        )
    }
    return {
        "total_records": total,
        "positive_count": pos,
        "negative_count": neg,
        "unknown_count": unknown,
        "positive_percentage": round(percent_pos, 2),
        "unique_settlements": len(settlements),
        "unique_districts": len(districts),
        "matched_ifi_events": len(matched_ueis),
        "date_range": date_range,
        "earliest_positive_date": earliest_pos,
        "latest_positive_date": latest_pos,
        "missing_dates": missing_dates,
        "invalid_dates": invalid_dates,
        "duplicate_records": duplicate_records,
        "nan_feature_values": nan_values,
        "districts_without_matches": list(districts_no_match),
    }

def write_report(report: Dict[str, Any], txt_path: Path, json_path: Path):
    # Human‑readable txt
    lines = [
        "=== Validation Report ===",
        f"Total records            : {report['total_records']}",
        f"Positive (flood) count  : {report['positive_count']}",
        f"Negative (no flood) count: {report['negative_count']}",
        f"Unknown/unmatched count  : {report['unknown_count']}",
        f"Positive percentage       : {report['positive_percentage']}%",
        f"Unique settlements        : {report['unique_settlements']}",
        f"Unique districts          : {report['unique_districts']}",
        f"Matched IFI events        : {report['matched_ifi_events']}",
        f"Date range                : {report['date_range'][0]} to {report['date_range'][1]}",
        f"Earliest positive date   : {report['earliest_positive_date']}",
        f"Latest positive date     : {report['latest_positive_date']}",
        f"Missing dates             : {report['missing_dates']}",
        f"Invalid dates             : {report['invalid_dates']}",
        f"Duplicate records         : {report['duplicate_records']}",
        f"NaN/null feature values   : {report['nan_feature_values']}",
        f"Districts without matches : {', '.join(report['districts_without_matches'])}",
    ]
    txt_path.write_text("\n".join(lines), encoding="utf-8")
    # JSON version
    json_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")

def main():
    if not FEATURES_FILE.is_file():
        sys.exit(f"Historical features file not found at {FEATURES_FILE}")
    print("Loading historical features …")
    features = load_historical_features(FEATURES_FILE)
    print(f"Loaded {len(features)} feature records.")
    print("Loading IFI flood inventory …")
    events = load_ifi_events(IFI_CSV)
    print(f"Loaded {len(events)} IFI flood events.")
    print("Generating flood labels …")
    enriched = generate_labels(features, events)
    print(f"Writing enriched dataset to {OUTPUT_FILE} …")
    OUTPUT_FILE.write_text(json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Running validation …")
    report = validate_dataset(enriched)
    print(f"Writing validation report to {REPORT_TXT} and {REPORT_JSON} …")
    write_report(report, REPORT_TXT, REPORT_JSON)
    print("Done.")

if __name__ == "__main__":
    main()
