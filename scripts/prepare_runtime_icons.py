from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ICONS = ROOT / "public" / "icons"


def convert(source: Path, target: Path) -> tuple[int, int]:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        rgba = original.convert("RGBA")
        rgba.save(target, format="WEBP", lossless=True, method=6, exact=True)
        with Image.open(target) as encoded:
            decoded = encoded.convert("RGBA")
            if ImageChops.difference(rgba, decoded).getbbox() is not None:
                raise RuntimeError(f"Runtime icon is not pixel-identical: {target}")
    return source.stat().st_size, target.stat().st_size


def main() -> None:
    rows: list[tuple[str, int, int]] = []
    for stale in (PUBLIC_ICONS / "system" / "runtime").glob("*.webp"):
        stale.unlink()
    for source in sorted((PUBLIC_ICONS / "third_party").glob("*.png")):
        target = PUBLIC_ICONS / "third_party" / "runtime" / f"{source.stem}.webp"
        before, after = convert(source, target)
        rows.append((str(target.relative_to(ROOT)), before, after))
    total_before = sum(row[1] for row in rows)
    total_after = sum(row[2] for row in rows)
    for path, before, after in rows:
        print(f"{path}: {before} -> {after} bytes")
    print(f"TOTAL: {total_before} -> {total_after} bytes ({total_after / total_before:.1%})")


if __name__ == "__main__":
    main()
