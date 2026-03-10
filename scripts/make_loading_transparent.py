from pathlib import Path

from PIL import Image


def main() -> None:
    base_dir = Path(__file__).resolve().parents[1]
    image_path = base_dir / "dhamma-web" / "src" / "images" / "loading_image.png"
    output_path = image_path

    image = Image.open(image_path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    corners = [
        pixels[0, 0],
        pixels[width - 1, 0],
        pixels[0, height - 1],
        pixels[width - 1, height - 1],
    ]

    avg = [sum(channel) / len(corners) for channel in zip(*corners)]
    threshold = 50

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dr = r - avg[0]
            dg = g - avg[1]
            db = b - avg[2]
            distance = (dr * dr + dg * dg + db * db) ** 0.5
            if distance < threshold:
                pixels[x, y] = (r, g, b, 0)

    image.save(output_path)


if __name__ == "__main__":
    main()
