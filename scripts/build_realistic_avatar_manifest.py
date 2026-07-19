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
    "wechat-zhoulan-roses.png": {
        "runtimeEntityKey": "actor.zhoulan",
        "category": "personal-flower-photo",
        "promptSummary": "Casual phone photo of pink roses on an ordinary residential balcony.",
    },
    "xhs-after-chapter-three.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.after-chapter-three",
        "category": "reading-object-photo",
        "promptSummary": "Open paperback, pen and tea beside a rainy cafe window.",
    },
    "xhs-eight-forty-two-cat.png": {
        "platform": "cross-platform",
        "runtimeEntityKey": "social.author.eight-forty-two",
        "category": "pet-photo",
        "promptSummary": "Sleepy orange-and-white cat beside an unreadable alarm clock on a rainy morning.",
    },
    "xhs-food-noodles.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.today-eat-what",
        "category": "food-photo",
        "promptSummary": "Ordinary neighborhood clear-broth noodle bowl photographed by phone.",
    },
    "xhs-hard-drive-light.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.hard-drive-light",
        "category": "technology-object-photo",
        "promptSummary": "Used external hard drive connected to a laptop on an evening desk.",
    },
    "xhs-lunch-ten-min.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.lunch-ten-minutes",
        "category": "food-photo",
        "promptSummary": "Ordinary weekday cafeteria tray with rice, vegetables, tomato and egg, and soup.",
    },
    "xhs-nanan-rain-walk.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.south-bank-slow-walk",
        "category": "candid-travel-photo",
        "promptSummary": "Fictional adult seen from behind walking with an umbrella beside a wet urban river path.",
    },
    "xhs-orange-folder.png": {
        "platform": "cross-platform",
        "runtimeEntityKey": "social.author.orange-folder",
        "category": "stationery-object-photo",
        "promptSummary": "Worn orange document folder, pen and paper clips on a pale wooden desk.",
    },
    "xhs-riverside-bike.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.riverside-not-river",
        "category": "city-landscape-photo",
        "promptSummary": "Green bicycle beside a public riverside path after rain.",
    },
    "xhs-white-shoelace.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.white-shoelace",
        "category": "outfit-photo",
        "promptSummary": "Fictional adult's casual neck-down mirror outfit photo in an apartment entryway.",
    },
    "xhs-window-outlet.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.by-the-outlet",
        "category": "travel-object-photo",
        "promptSummary": "Canvas tote and paperback beside a high-speed train window and power outlet.",
    },
    "xhs-wood-desk.png": {
        "platform": "xiaohongshu",
        "runtimeEntityKey": "xhs.author.wood-desk-edge",
        "category": "home-object-photo",
        "promptSummary": "Used wooden desk with mug, open book and glasses under evening lamp light.",
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
                "platform": metadata.get("platform", "wechat"),
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
