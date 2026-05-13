from PIL import Image
import os

INPUT_PATH = os.path.join("public", "assets", "gameboy", "gameboy.png")
OUT_DIR = os.path.join("public", "assets", "gameboy", "rotations")


def ensure_outdir():
    os.makedirs(OUT_DIR, exist_ok=True)


def generate_rotations():
    if not os.path.exists(INPUT_PATH):
        print(f"Input not found: {INPUT_PATH}")
        return 1

    img = Image.open(INPUT_PATH).convert("RGBA")
    w, h = img.size

    # Use a larger square canvas to avoid clipping when rotating
    canvas_size = max(w, h) * 2
    cx = (canvas_size - w) // 2
    cy = (canvas_size - h) // 2

    ensure_outdir()

    for i in range(8):
        angle = i * 45
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        canvas.paste(img, (cx, cy), img)

        # For pixel-art, use NEAREST resampling
        rotated = canvas.rotate(angle, resample=Image.NEAREST, expand=False)

        # Optionally trim transparent border to keep images tight
        bbox = rotated.getbbox()
        if bbox:
            cropped = rotated.crop(bbox)
        else:
            cropped = rotated

        # Save with consistent filenames
        out_path = os.path.join(OUT_DIR, f"rot_{i:02d}.png")
        cropped.save(out_path)
        print(f"Saved {out_path} (angle={angle})")

    print("Done: 8 rotations generated in:", OUT_DIR)
    return 0


if __name__ == "__main__":
    raise SystemExit(generate_rotations())
