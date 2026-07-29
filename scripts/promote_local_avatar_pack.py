from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw


MODEL_ID = "SG161222/Realistic_Vision_V5.1_noVAE"
MODEL_REVISION = "1e9f017a7b1eaefb63a1900ea6c5953d2739fd21"
COUNT = 128


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit and promote a locally generated avatar review pack into the runtime."
    )
    parser.add_argument("--review-dir", type=Path, required=True)
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--promote", action="store_true")
    return parser.parse_args()


def average_hash(image: Image.Image) -> int:
    resampling = getattr(Image, "Resampling", Image).LANCZOS
    pixels = list(image.convert("L").resize((8, 8), resampling).getdata())
    mean = sum(pixels) / len(pixels)
    value = 0
    for pixel in pixels:
        value = (value << 1) | int(pixel >= mean)
    return value


def make_contact_sheets(paths: list[Path], output_dir: Path) -> list[str]:
    output_dir.mkdir(parents=True, exist_ok=True)
    result: list[str] = []
    thumb_size = 128
    label_height = 20
    columns = 8
    page_size = 32
    for page_index in range(0, len(paths), page_size):
        page = paths[page_index : page_index + page_size]
        rows = (len(page) + columns - 1) // columns
        sheet = Image.new("RGB", (columns * thumb_size, rows * (thumb_size + label_height)), "#f3f4f6")
        draw = ImageDraw.Draw(sheet)
        for local_index, path in enumerate(page):
            image = Image.open(path).convert("RGB")
            x = (local_index % columns) * thumb_size
            y = (local_index // columns) * (thumb_size + label_height)
            sheet.paste(image.resize((thumb_size, thumb_size)), (x, y))
            ordinal = page_index + local_index + 1
            draw.text((x + 5, y + thumb_size + 3), f"{ordinal:03d}", fill="#111827")
        filename = f"local-avatar-contact-sheet-{page_index // page_size + 1}.jpg"
        sheet.save(output_dir / filename, quality=90, optimize=True)
        result.append(filename)
    return result


def main() -> None:
    args = parse_args()
    runtime_source = args.review_dir / "runtime"
    paths = [runtime_source / f"generated-avatar-{index:03d}.png" for index in range(1, COUNT + 1)]
    missing = [str(path) for path in paths if not path.exists()]
    if missing:
        raise SystemExit(f"Review pack is incomplete; missing {len(missing)} file(s), first: {missing[0]}")

    assets = []
    seen_sha: dict[str, int] = {}
    seen_hashes: list[tuple[int, int]] = []
    exact_duplicates: list[tuple[int, int]] = []
    near_duplicates: list[tuple[int, int, int]] = []
    for index, path in enumerate(paths, start=1):
        payload = path.read_bytes()
        sha256 = hashlib.sha256(payload).hexdigest()
        image = Image.open(path).convert("RGB")
        if image.size != (192, 192):
            raise SystemExit(f"{path.name} has unexpected dimensions {image.size}; expected 192x192")
        if sha256 in seen_sha:
            exact_duplicates.append((seen_sha[sha256], index))
        seen_sha[sha256] = index
        current_hash = average_hash(image)
        for prior_index, prior_hash in seen_hashes:
            distance = (current_hash ^ prior_hash).bit_count()
            if distance <= 3:
                near_duplicates.append((prior_index, index, distance))
        seen_hashes.append((index, current_hash))
        assets.append(
            {
                "slot": index - 1,
                "id": f"avatar.generated.{index:03d}",
                "path": f"/media/case-001/avatars/generated-avatar-{index:03d}.png",
                "kind": (
                    "ordinary-person"
                    if index <= 56
                    else "pet"
                    if index <= 80
                    else "everyday-scene"
                    if index <= 104
                    else "everyday-object"
                ),
                "seed": 1_152_000 + index * 7_919,
                "sha256": sha256,
                "width": image.width,
                "height": image.height,
                "format": "PNG",
            }
        )

    if exact_duplicates:
        raise SystemExit(f"Exact duplicate avatars found: {exact_duplicates}")

    evidence_dir = args.project_root / "test-results" / "full-realism" / "avatar-local-generation"
    sheets = make_contact_sheets(paths, evidence_dir)
    report = {
        "schemaVersion": 2,
        "purpose": "Fictional ordinary-user profile avatars for player-visible Chinese social and communication apps",
        "source": "Local GPU generation with public Stable Diffusion weights; no image-generation API or API key",
        "model": {
            "id": MODEL_ID,
            "revision": MODEL_REVISION,
            "license": "CreativeML Open RAIL-M",
            "modelCard": f"https://huggingface.co/{MODEL_ID}",
        },
        "generation": {
            "deviceClass": "local CUDA GPU",
            "scheduler": "EulerAncestralDiscreteScheduler",
            "steps": 24,
            "guidanceScale": 5.25,
            "sourceSize": [512, 512],
            "runtimeSize": [192, 192],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        },
        "constraints": [
            "Fictional identities only",
            "No avatar is a narrative clue",
            "No real location, address, brand, or celebrity identity is intentionally depicted",
            "The pack mixes ordinary people, pets, everyday scenes, and ordinary objects",
            "Stable seeds and local runtime files make later builds deterministic",
        ],
        "audit": {
            "assetCount": len(assets),
            "exactDuplicateCount": len(exact_duplicates),
            "nearDuplicateCountAtAHashDistance3": len(near_duplicates),
            "nearDuplicates": [
                {"left": left, "right": right, "distance": distance}
                for left, right, distance in near_duplicates
            ],
            "contactSheets": [
                f"test-results/full-realism/avatar-local-generation/{filename}" for filename in sheets
            ],
            "manualVisualReviewRequired": True,
        },
        "assets": assets,
    }

    review_report = args.review_dir / "local-avatar-generation-manifest.json"
    review_report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.promote:
        runtime_dir = args.project_root / "public" / "media" / "case-001" / "avatars"
        manifest_path = args.project_root / "content" / "case-001" / "media" / "generated-avatar-manifest.json"
        for source in paths:
            shutil.copy2(source, runtime_dir / source.name)
        manifest_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "assetCount": len(assets),
                "exactDuplicateCount": len(exact_duplicates),
                "nearDuplicateCount": len(near_duplicates),
                "contactSheets": sheets,
                "promoted": args.promote,
                "reviewManifest": str(review_report),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
