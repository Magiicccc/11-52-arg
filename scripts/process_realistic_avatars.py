from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
AVATAR_DIR = ROOT / "public" / "media" / "case-001" / "avatars" / "realistic"
REPORT_PATH = ROOT / "content" / "case-001" / "media" / "realistic-avatar-processing.json"
TARGET_SIZE = (256, 256)
CROP_INSETS = {
    "wechat-delivery-service.png": (110, 110, 110, 110),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    assets: list[dict[str, object]] = []
    for path in sorted(AVATAR_DIR.glob("*.png")):
        with Image.open(path) as source:
            source_width, source_height = source.size
            image = source.convert("RGB")
            crop = CROP_INSETS.get(path.name)
            if crop:
                left, top, right, bottom = crop
                image = image.crop(
                    (
                        left,
                        top,
                        image.width - right,
                        image.height - bottom,
                    )
                )
            if image.size != TARGET_SIZE:
                image = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
            image.save(path, format="PNG", optimize=True, compress_level=9)

        assets.append(
            {
                "filename": path.name,
                "runtimePath": f"/media/case-001/avatars/realistic/{path.name}",
                "sourceWidth": source_width,
                "sourceHeight": source_height,
                "runtimeWidth": TARGET_SIZE[0],
                "runtimeHeight": TARGET_SIZE[1],
                "cropInsets": CROP_INSETS.get(path.name),
                "bytes": path.stat().st_size,
                "sha256": sha256(path),
            }
        )

    report = {
        "schemaVersion": 1,
        "operation": "deterministic resize and PNG optimization",
        "targetSize": {"width": TARGET_SIZE[0], "height": TARGET_SIZE[1]},
        "assetCount": len(assets),
        "assets": assets,
    }
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"assetCount": len(assets), "report": str(REPORT_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
