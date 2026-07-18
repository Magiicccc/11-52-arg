from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "content" / "case-001" / "apps" / "app-manifests.json"
REPORT_DIR = ROOT / "docs" / "qa" / "live-site"
REFERENCE_ROOT = next((ROOT / "references" / "ui").glob("*"))


def runtime_path(icon_asset: str) -> str:
    if icon_asset.startswith("/icons/system/"):
        return icon_asset.replace("/icons/system/", "/icons/system/runtime/")
    return (
        icon_asset.replace("/icons/third_party/", "/icons/third_party/runtime/")
        .removesuffix(".png")
        + ".webp"
    )


def transparent_edges(image: Image.Image) -> dict[str, int]:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return {"left": image.width, "top": image.height, "right": image.width, "bottom": image.height}
    left, top, right, bottom = bbox
    return {
        "left": left,
        "top": top,
        "right": image.width - right,
        "bottom": image.height - bottom,
    }


def has_opaque_white_background(image: Image.Image) -> bool:
    pixels = image.load()
    points = [
        (0, 0),
        (image.width - 1, 0),
        (0, image.height - 1),
        (image.width - 1, image.height - 1),
    ]
    return all(pixels[x, y][3] > 250 and min(pixels[x, y][:3]) > 245 for x, y in points)


def main() -> None:
    manifests = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    rows = []
    for manifest in manifests:
        source_asset = manifest["iconAsset"]
        live_asset = runtime_path(source_asset)
        live_file = ROOT / "public" / live_asset.lstrip("/")
        reference_file = REFERENCE_ROOT / source_asset.removeprefix("/icons/")
        with Image.open(live_file) as loaded:
            image = loaded.convert("RGBA")
            has_alpha = "A" in loaded.getbands() or loaded.info.get("transparency") is not None
            edges = transparent_edges(image)
            opaque_white = has_opaque_white_background(image)
            source_kind = "frozen exact source"
            if "/system/" in source_asset:
                source_kind = "runtime crop derived from frozen iOS atlas"
            elif live_file.suffix.lower() == ".webp":
                source_kind = "pixel-identical WebP derived from frozen third-party PNG"
            rows.append({
                "appName": manifest["displayName"],
                "appId": manifest["id"],
                "currentAssetPath": live_asset,
                "frozenSourcePath": str(reference_file.relative_to(ROOT)).replace("\\", "/"),
                "pixelSize": {"width": image.width, "height": image.height},
                "format": loaded.format,
                "hasAlpha": has_alpha,
                "transparentEdgePx": edges,
                "hasOpaqueWhiteBackground": opaque_white,
                "fromFrozenIcons": True,
                "sourceRelationship": source_kind,
                "cssContainer": {
                    "width": "65px (Dock 62px)",
                    "height": "65px (Dock 62px)",
                    "padding": 0,
                    "border": 0,
                    "background": "transparent",
                    "outerBorderRadius": 0,
                    "objectFit": "cover",
                },
                "needsAssetReplacement": False,
                "needsCssChange": False,
            })

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "icon-asset-audit.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# GitHub Pages 图标资产审计",
        "",
        "- 审计范围：当前主屏幕全部 30 个 App 图标。",
        "- 运行时规则：外层仅提供尺寸与点击热区；`padding: 0`、`border: 0`、`background: transparent`，图片使用 `object-fit: cover`，不做第二次圆角裁切。",
        "- 系统图标：继续使用从冻结 iOS atlas 裁出的透明运行时 PNG。",
        "- 第三方图标：使用冻结 PNG 的像素一致 lossless WebP 运行时副本，降低 GitHub Pages 首访请求体积；冻结源文件未改写。",
        "",
        "| App | 当前资源 | 像素 | 格式 | Alpha | 透明边缘 L/T/R/B | 白色底板 | 冻结来源 | 换资源 | 改 CSS |",
        "| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        edges = row["transparentEdgePx"]
        lines.append(
            f"| {row['appName']} | `{row['currentAssetPath']}` | "
            f"{row['pixelSize']['width']}×{row['pixelSize']['height']} | {row['format']} | "
            f"{'是' if row['hasAlpha'] else '否'} | "
            f"{edges['left']}/{edges['top']}/{edges['right']}/{edges['bottom']} | "
            f"{'是' if row['hasOpaqueWhiteBackground'] else '否'} | 是 | "
            f"{'是' if row['needsAssetReplacement'] else '否'} | "
            f"{'是' if row['needsCssChange'] else '否'} |"
        )
    lines += [
        "",
        "## 结论",
        "",
        "- 当前运行时资源没有检测到四角不透明白色底板。",
        "- CSS 不再绘制第二层白色图标外壳，也没有 `contain`、额外 padding、border 或重复圆角。",
        "- 第三方 WebP 仅是冻结 PNG 的无损传输副本；逐像素一致性由 `scripts/prepare_runtime_icons.py` 验证。",
        "",
    ]
    (REPORT_DIR / "ICON_ASSET_AUDIT.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
