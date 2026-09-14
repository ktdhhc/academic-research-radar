#!/usr/bin/env python3
import json
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]


def read_json(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: pathlib.Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: publish_radar_bundle.py data/inbox/YYYY-MM-DD.json")

    bundle_path = ROOT / sys.argv[1]
    bundle = read_json(bundle_path)
    date = bundle["date"]
    report = bundle["report"]
    index_entry = bundle["indexEntry"]
    ratings_map = bundle["ratings"]
    pdfs = bundle.get("pdfs", [])

    if bundle.get("schemaVersion") != 1:
        raise ValueError("bundle schemaVersion must be 1")
    if report.get("schemaVersion") != 1 or report.get("date") != date:
        raise ValueError("report schema/date mismatch")
    if index_entry.get("date") != date:
        raise ValueError("indexEntry date mismatch")
    for paper in report.get("papers", []):
        if "institution" not in paper:
            raise ValueError(f"paper missing institution: {paper.get('id')}")

    report_path = ROOT / f"data/reports/{date}.json"
    write_json(report_path, report)
    write_json(ROOT / "data/latest.json", report)

    index_path = ROOT / "data/index.json"
    index = read_json(index_path)
    issues = [x for x in index.get("issues", []) if x.get("date") != date and x.get("path") != index_entry.get("path")]
    index["schemaVersion"] = 1
    index["issues"] = [index_entry] + issues
    write_json(index_path, index)

    ratings_path = ROOT / "data/ratings.json"
    ratings = read_json(ratings_path) if ratings_path.exists() else {
        "schemaVersion": 1,
        "scale": {"min": 1, "max": 7, "center": 4, "method": "relative-normal"},
        "ratings": {}
    }
    ratings["schemaVersion"] = 1
    ratings["updatedAt"] = date
    ratings["ratings"] = ratings_map
    write_json(ratings_path, ratings)

    manifest = {"date": date, "papers": pdfs}
    write_json(ROOT / "data/pdf-archive-manifest.json", manifest)

    headers = {"User-Agent": "academic-research-radar/1.0 (+https://github.com/ktdhhc/academic-research-radar)"}
    for item in pdfs:
        target_rel = pathlib.PurePosixPath(item["path"])
        expected_prefix = pathlib.PurePosixPath("papers") / date
        if target_rel.parts[:2] != expected_prefix.parts:
            raise ValueError(f"PDF path must be under papers/{date}/: {target_rel}")
        target = ROOT / pathlib.Path(*target_rel.parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and target.stat().st_size > 10000:
            print(f"skip existing: {target_rel}")
            continue
        try:
            req = urllib.request.Request(item["pdfUrl"], headers=headers)
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
            if not data.startswith(b"%PDF"):
                raise RuntimeError("response is not a PDF")
            target.write_bytes(data)
            print(f"archived {target_rel} ({len(data)} bytes)")
        except Exception as exc:
            print(f"WARNING: PDF archive failed for {item.get('title')}: {exc}", file=sys.stderr)

    bundle_path.unlink()
    print(f"published radar bundle for {date}")


if __name__ == "__main__":
    main()
