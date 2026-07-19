from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROCESSING_PATH = ROOT / "content" / "case-001" / "media" / "realistic-avatar-processing.json"
MANIFEST_PATH = ROOT / "content" / "case-001" / "media" / "realistic-avatar-manifest.json"

METADATA = {
    "wechat-badminton-group.png": {
        "runtimeEntityKey": "wechat.daily-gym",
        "category": "hobby-group-photo",
        "promptSummary": "Four badminton rackets, shuttlecocks and shoes on an ordinary community court.",
    },
    "wechat-book-club.png": {
        "runtimeEntityKey": "wechat.daily.book-club",
        "category": "hobby-object-photo",
        "promptSummary": "Casual cafe-table snapshot of books, tea, glasses and a leafy branch.",
    },
    "wechat-chenyu-umbrella.png": {
        "runtimeEntityKey": "wechat.daily.chenyu",
        "category": "personal-object-photo",
        "promptSummary": "Folded black umbrella and dark green bicycle on a rainy residential street.",
    },
    "wechat-cloud-service.png": {
        "runtimeEntityKey": "wechat.daily-cloud",
        "category": "service-illustration",
        "promptSummary": "Full-bleed editorial illustration of a cloud reflected in a hard drive.",
    },
    "wechat-delivery-service.png": {
        "runtimeEntityKey": "wechat.daily.delivery",
        "category": "service-illustration",
        "promptSummary": "Parcel inside a green smart locker; outer generated icon frame removed in post-processing.",
    },
    "wechat-engineer-lin.png": {
        "runtimeEntityKey": "wechat.daily.lin",
        "category": "casual-portrait",
        "promptSummary": "Fictional East Asian male engineer on an ordinary weekend riverside walk.",
    },
    "wechat-family-dinner.png": {
        "runtimeEntityKey": "wechat.daily.family",
        "category": "family-group-photo",
        "promptSummary": "Fictional Chinese family at a casual home dinner, photographed by phone.",
    },
    "wechat-file-transfer.png": {
        "runtimeEntityKey": "wechat.daily-self",
        "category": "system-service-illustration",
        "promptSummary": "Documents moving between a laptop and phone in a restrained editorial style.",
    },
    "wechat-neighbor-cat.png": {
        "runtimeEntityKey": "wechat.daily.neighbor",
        "category": "pet-photo",
        "promptSummary": "Orange tabby cat sleeping beside a rainy apartment window.",
    },
    "wechat-photo-shop-camera.png": {
        "runtimeEntityKey": "wechat.daily.chen",
        "category": "personal-object-photo",
        "promptSummary": "Well-used film camera and canisters on a neighborhood shop counter.",
    },
    "wechat-photographer-gu.png": {
        "runtimeEntityKey": "wechat.daily.gu",
        "category": "candid-hobby-photo",
        "promptSummary": "Fictional amateur photographer under a transparent umbrella, face turned away.",
    },
    "wechat-property-building.png": {
        "runtimeEntityKey": "wechat.daily.property",
        "category": "service-location-photo",
        "promptSummary": "Deidentified modern apartment entrance after rain.",
    },
    "wechat-reception-xu.png": {
        "runtimeEntityKey": "wechat.daily.xu",
        "category": "casual-selfie",
        "promptSummary": "Fictional young East Asian office receptionist in a natural window-light selfie.",
    },
    "wechat-research-team.png": {
        "runtimeEntityKey": "wechat.daily.research-group",
        "category": "work-group-photo",
        "promptSummary": "Top-down meeting-table snapshot with notebooks, cups, recorder and hands; no faces.",
    },
    "wechat-weekend-photo-group.png": {
        "runtimeEntityKey": "wechat.daily.photo-group",
        "category": "hobby-group-photo",
        "promptSummary": "Four fictional East Asian adult photographers in an ordinary rainy-day group snapshot.",
    },
}


def main() -> None:
    processing = json.loads(PROCESSING_PATH.read_text(encoding="utf-8"))
    processing_assets = {asset["filename"]: asset for asset in processing["assets"]}
    missing = sorted(set(METADATA) - set(processing_assets))
    extra = sorted(set(processing_assets) - set(METADATA))
    if missing or extra:
        raise RuntimeError(f"Avatar metadata mismatch: missing={missing}, extra={extra}")

    assets = []
    for filename, metadata in METADATA.items():
        processed = processing_assets[filename]
        assets.append(
            {
                "id": f"avatar.realistic.{metadata['runtimeEntityKey']}",
                "platform": "wechat",
                **metadata,
                "path": processed["runtimePath"],
                "width": processed["runtimeWidth"],
                "height": processed["runtimeHeight"],
                "bytes": processed["bytes"],
                "sha256": processed["sha256"],
                "postProcessing": {
                    "operation": processing["operation"],
                    "cropInsets": processed["cropInsets"],
                },
                "source": "OpenAI built-in image generation",
                "generatedAt": "2026-07-19",
                "narrativeRole": "ordinary-ui-identity-only",
                "isClue": False,
            }
        )

    manifest = {
        "schemaVersion": 1,
        "status": "production-candidate",
        "purpose": "Fictional profile images for realistic Chinese internet UI surfaces",
        "constraints": [
            "Fictional identities only",
            "No generated artifact may be interpreted as evidence",
            "No readable address, real-world location binding, brand logo, watermark, clue, or anomaly",
            "Core story identities use non-face lifestyle images to avoid premature identity disclosure",
            "Every runtime identity is bound semantically rather than by list position",
        ],
        "assetCount": len(assets),
        "assets": assets,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"assetCount": len(assets), "manifest": str(MANIFEST_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
