from __future__ import annotations

import argparse
import random
from pathlib import Path

import torch
from diffusers import EulerAncestralDiscreteScheduler, StableDiffusionPipeline
from PIL import Image


MODEL_ID = "SG161222/Realistic_Vision_V5.1_noVAE"
BASE_SEED = 1_152_000

HUMAN_SCENES = [
    "beside an apartment window on an overcast afternoon",
    "waiting at a quiet city bus stop after work",
    "on a tree-lined neighborhood street in early morning",
    "sitting by a cafe window with an ordinary ceramic mug",
    "walking along a riverside greenway at sunset",
    "in a small home study with books and houseplants",
    "outside a convenience store under mixed night lighting",
    "on a subway platform during a normal weekday",
    "at a public badminton court after a casual game",
    "near an old residential compound entrance after rain",
    "at a weekend farmers market carrying a canvas bag",
    "on a train by the window in soft daylight",
]

HUMAN_FRAMING = [
    "casual phone selfie, slightly off-center",
    "candid half-profile, looking away from camera",
    "face partly hidden by loose hair",
    "backlit side profile with an imperfect crop",
    "reflection in a slightly dusty mirror",
    "upper body snapshot taken by a friend",
    "face partly covered by a scarf, relaxed eyes",
    "looking down at a phone, unposed",
]

HUMAN_WARDROBE = [
    "plain dark hoodie",
    "light denim jacket",
    "olive windbreaker",
    "cream knit sweater",
    "simple black coat",
    "grey sweatshirt",
    "navy rain jacket",
    "checked overshirt",
]

PET_SUBJECTS = [
    "sleepy orange tabby cat",
    "round-faced British shorthair cat",
    "black-and-white tuxedo cat",
    "small brown poodle",
    "cream-colored corgi",
    "quiet Shiba Inu",
    "grey tabby kitten",
    "white rabbit with upright ears",
]

PET_SCENES = [
    "curled on a lived-in sofa in daylight",
    "watching rain through an apartment window",
    "sitting beside slippers near the front door",
    "resting under a wooden dining chair",
    "peeking out of a plain canvas tote bag",
    "on a balcony beside ordinary green plants",
    "lying near a warm desk lamp at night",
    "sitting on a tiled floor in morning light",
]

SCENE_SUBJECTS = [
    "rain drops on a bus window with blurred city lights",
    "quiet riverside cycling path after rain",
    "apartment balcony plants in soft morning light",
    "ordinary neighborhood alley at blue hour",
    "sunset seen from a high-rise apartment window",
    "empty badminton court under evening lamps",
    "train window view of green fields",
    "small public park path covered with fallen leaves",
    "clouds reflected in a shallow roadside puddle",
    "dim reading corner with a floor lamp",
    "old brick wall covered with summer vines",
    "bicycle parked beneath a residential building",
]

OBJECT_SUBJECTS = [
    "compact film camera on a scratched wooden desk",
    "handwritten notebook beside black wired earphones",
    "bowl of tomato egg noodles on a small kitchen table",
    "fresh bouquet wrapped in plain brown paper",
    "pair of worn canvas sneakers by an apartment door",
    "small desk lamp illuminating an open paperback",
    "vinyl record and headphones on a fabric sofa",
    "homemade lunch box photographed before work",
    "mechanical keyboard beside a half-finished coffee",
    "old silver bicycle bell in afternoon light",
    "ceramic cat figurine on a crowded bookshelf",
    "mandarin oranges in a simple white bowl",
    "folded umbrella drying beside a tiled doorway",
    "potted succulent on a narrow windowsill",
    "plain canvas tote bag on a wooden chair",
    "small strawberry cake on a cafe table",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a fictional Chinese-internet-style avatar review pack locally without an API key."
    )
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--start", type=int, default=1, help="First one-based avatar index.")
    parser.add_argument("--end", type=int, default=128, help="Last one-based avatar index.")
    parser.add_argument("--steps", type=int, default=24)
    parser.add_argument("--size", type=int, default=512)
    parser.add_argument("--review-size", type=int, default=192)
    parser.add_argument("--model-id", default=MODEL_ID)
    return parser.parse_args()


def build_prompt(index: int) -> tuple[str, str, str]:
    rng = random.Random(BASE_SEED + index * 7_919)
    zero_index = index - 1

    if zero_index < 56:
        gender = "Chinese woman" if zero_index % 2 == 0 else "Chinese man"
        age = rng.choice([22, 24, 27, 29, 31, 34, 38, 43, 49, 56])
        prompt = (
            f"RAW candid smartphone photo, authentic ordinary Chinese internet profile avatar, "
            f"{gender} age {age}, East Asian Chinese features, {rng.choice(HUMAN_FRAMING)}, "
            f"{rng.choice(HUMAN_WARDROBE)}, {rng.choice(HUMAN_SCENES)}, natural skin texture, "
            "real everyday atmosphere, subtle phone compression, square social media crop"
        )
        kind = "ordinary-person"
        negative = (
            "professional studio portrait, corporate headshot, passport photo, glamour, influencer pose, "
            "beauty retouching, plastic skin, perfect symmetry, western stock photo, celebrity, anime, "
            "illustration, cgi, text, logo, watermark, extra fingers, bad hands, deformed face, duplicate"
        )
    elif zero_index < 80:
        prompt = (
            f"RAW casual smartphone photo used as a Chinese social media avatar, "
            f"{rng.choice(PET_SUBJECTS)} {rng.choice(PET_SCENES)}, lived-in Chinese apartment details, "
            "natural imperfect framing, soft realistic fur, subtle phone compression, square crop"
        )
        kind = "pet"
        negative = (
            "human, studio pet portrait, advertisement, costume, cartoon, anime, cgi, plastic fur, "
            "text, logo, watermark, duplicate animal, extra legs, deformed paws, blurry, low quality"
        )
    elif zero_index < 104:
        prompt = (
            f"RAW casual smartphone photo used as an understated Chinese internet avatar, "
            f"{rng.choice(SCENE_SUBJECTS)}, ordinary contemporary Chinese city atmosphere, "
            "natural light, slightly imperfect composition, subtle phone compression, square crop"
        )
        kind = "everyday-scene"
        negative = (
            "person in foreground, landmark, tourist postcard, luxury advertisement, fantasy, horror, "
            "text, logo, watermark, excessive HDR, oversaturated, cgi, illustration, blurry, low quality"
        )
    else:
        prompt = (
            f"RAW casual smartphone still life used as a Chinese social media avatar, "
            f"{rng.choice(OBJECT_SUBJECTS)}, ordinary lived-in apartment or neighborhood setting, "
            "natural available light, imperfect personal snapshot, subtle phone compression, square crop"
        )
        kind = "everyday-object"
        negative = (
            "person, product advertisement, professional studio, luxury styling, suspicious clue, horror, "
            "readable text, logo, watermark, excessive bokeh, cgi, illustration, blurry, low quality"
        )
    return prompt, negative, kind


def main() -> None:
    args = parse_args()
    if args.start < 1 or args.end < args.start:
        raise SystemExit("--start and --end must define a positive inclusive range")
    if not torch.cuda.is_available():
        raise SystemExit("CUDA is unavailable. This script intentionally refuses the very slow CPU path.")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    originals = args.output_dir / "originals"
    runtime = args.output_dir / "runtime"
    originals.mkdir(exist_ok=True)
    runtime.mkdir(exist_ok=True)

    pipe = StableDiffusionPipeline.from_pretrained(
        args.model_id,
        torch_dtype=torch.float16,
        use_safetensors=True,
        safety_checker=None,
        requires_safety_checker=False,
    )
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to("cuda")
    pipe.enable_attention_slicing()

    for index in range(args.start, args.end + 1):
        ordinal = f"{index:03d}"
        prompt, negative_prompt, kind = build_prompt(index)
        seed = BASE_SEED + index * 7_919
        image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=args.size,
            height=args.size,
            num_inference_steps=args.steps,
            guidance_scale=5.25,
            generator=torch.Generator(device="cuda").manual_seed(seed),
        ).images[0]
        image.save(originals / f"avatar-{ordinal}-{kind}.png")
        resampling = getattr(Image, "Resampling", Image).LANCZOS
        image.resize((args.review_size, args.review_size), resampling).save(
            runtime / f"generated-avatar-{ordinal}.png",
            optimize=True,
        )
        print(f"{ordinal}\t{kind}\tseed={seed}", flush=True)


if __name__ == "__main__":
    main()
