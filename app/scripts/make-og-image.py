"""Draws public/og.png (1200x630), the picture link previews show, with the standard library only.

Pixel-art sea in the app's palette plus the title in a 5x7 pixel font. It uses no sprites from the licensed
sprite pack, so the image is safe to publish. Run from the app folder:  python3 scripts/make-og-image.py
"""
import struct
import zlib

W, H, UNIT = 1200, 630, 10  # one art pixel = UNIT x UNIT screen pixels

SKY = ["#73bed3", "#8ccfd6", "#a4dddb", "#c8e5e2"]
SEA = ["#4f8fba", "#3c5e8b", "#253a5e", "#172038"]
GOLD, ORANGE, INK, FOAM = "#e8c170", "#da863e", "#090a14", "#ebede9"

FONT = {
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    " ": ["00000"] * 7,
}


def rgb(hex_color):
    return tuple(int(hex_color[i : i + 2], 16) for i in (1, 3, 5))


pixels = [[rgb(INK)] * W for _ in range(H)]


def rect(x, y, w, h, color):
    c = rgb(color)
    for yy in range(max(0, y), min(H, y + h)):
        row = pixels[yy]
        for xx in range(max(0, x), min(W, x + w)):
            row[xx] = c


def text(message, x, y, unit, color, shadow=None):
    # Shadow first for the whole line, so a neighbour's shadow never covers a letter.
    for layer, offset in ([(shadow, max(2, unit // 3))] if shadow else []) + [(color, 0)]:
        cursor = x
        for ch in message:
            for r, line in enumerate(FONT[ch]):
                for c, bit in enumerate(line):
                    if bit == "1":
                        rect(cursor + c * unit + offset, y + r * unit + offset, unit, unit, layer)
            cursor += 6 * unit


def text_width(message, unit):
    return len(message) * 6 * unit - unit


# sky bands, then sea bands below the horizon
horizon = 330
band = horizon // len(SKY)
for i, color in enumerate(SKY):
    rect(0, i * band, W, band + (horizon - band * len(SKY) if i == len(SKY) - 1 else 0), color)
sea_band = (H - horizon) // len(SEA)
for i, color in enumerate(SEA):
    rect(0, horizon + i * sea_band, W, sea_band + (H - horizon - sea_band * len(SEA) if i == len(SEA) - 1 else 0), color)

# foam line on the horizon
for x in range(0, W, 40):
    rect(x, horizon - 4, 24, 8, FOAM)

# half sun on the horizon
cx, radius = 1010, 90
for yy in range(horizon - radius, horizon):
    half = int((radius**2 - (yy - horizon) ** 2) ** 0.5)
    rect(cx - half, yy, 2 * half, 1, GOLD)
for i, w in enumerate([260, 200, 140]):
    rect(cx - w // 2, horizon + 24 + i * 22, w, 6, GOLD)

# bubbles
for bx, by, size in [(110, 420, 18), (170, 500, 12), (260, 450, 24), (1040, 470, 18), (1110, 540, 12), (980, 400, 12)]:
    rect(bx, by, size, 4, FOAM)
    rect(bx, by + size - 4, size, 4, FOAM)
    rect(bx, by, 4, size, FOAM)
    rect(bx + size - 4, by, 4, size, FOAM)

# title: gold with an ink drop shadow, centred
title, subtitle = "2026 DIVE LOG", "YEAR END PARTY"
title_unit, subtitle_unit = 12, 6
text(title, (W - text_width(title, title_unit)) // 2, 110, title_unit, GOLD, shadow=INK)
text(subtitle, (W - text_width(subtitle, subtitle_unit)) // 2, 230, subtitle_unit, INK)


def png_bytes():
    raw = b"".join(b"\x00" + bytes(v for px in row for v in px) for row in pixels)

    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")


with open("public/og.png", "wb") as f:
    f.write(png_bytes())
print("wrote public/og.png", W, H)
