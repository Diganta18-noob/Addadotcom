import os, struct, zlib

def make_png(width, height, pixel_func, filepath):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0
        for x in range(width):
            r, g, b = pixel_func(x, y, width, height)
            raw_data.extend([r & 0xFF, g & 0xFF, b & 0xFF])
    
    compressed = zlib.compress(bytes(raw_data), level=6)
    
    def chunk(tag, data):
        buf = tag + data
        return struct.pack('>I', len(data)) + buf + struct.pack('>I', zlib.crc32(buf) & 0xFFFFFFFF)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(header + ihdr + idat + iend)
    print(f"Generated {filepath}")

# Generate Logo
def logo_pixel(x, y, w, h):
    cx, cy = w / 2, h / 2
    dist = ((x - cx)**2 + (y - cy)**2)**0.5
    if dist < 220:
        if dist > 210:
            return (212, 160, 86) # Outer Gold ring
        elif dist > 195:
            return (40, 30, 28)
        elif dist > 185:
            return (75, 46, 43) # Bronze inner ring
        else:
            # Coffee cup shape center
            if 150 <= x <= 362 and 180 <= y <= 320:
                # Cup body
                if (x - 256)**2 / 100**2 + (y - 250)**2 / 70**2 <= 1:
                    return (212, 160, 86)
            return (20, 16, 15) # Dark rich background
    return (0, 0, 0)

make_png(512, 512, logo_pixel, r"c:\Antigravity\Cafe\addadotcom\public\logo.png")

# Generate 9 screenshots with dark tech dashboard aesthetics
screenshots = [
    "homepage.png", "menu.png", "tracker.png", "kds.png",
    "billing.png", "analytics.png", "invoice.png", "tables.png", "qr.png"
]

colors = [
    ((212, 160, 86), (30, 25, 22)),   # Warm Bronze
    ((49, 120, 198), (18, 24, 34)),   # Tech Blue
    ((72, 187, 120), (18, 30, 24)),   # Emerald Green
    ((229, 62, 62), (32, 20, 20)),    # Ruby KDS Red
    ((159, 122, 234), (26, 22, 34)),  # Purple POS
    ((236, 148, 54), (32, 26, 18)),   # Amber Analytics
    ((56, 178, 172), (18, 30, 30)),   # Teal Invoice
    ((237, 100, 166), (32, 20, 28)),  # Rose Tables
    ((66, 153, 225), (20, 26, 34))    # Cyan QR
]

for idx, fname in enumerate(screenshots):
    accent, bg = colors[idx]
    def make_screen(x, y, w, h, acc=accent, background=bg, index=idx):
        # Top Bar
        if y < 48:
            if x < 200:
                return acc
            return (24, 24, 30)
        # Border outline
        if x < 4 or x >= w - 4 or y < 52 or y >= h - 4:
            return acc
        # Content cards grid
        card_x = (x - 20) % (w // 3)
        if card_x < 8:
            return (40, 40, 50)
        # Background
        return background

    make_png(800, 450, make_screen, os.path.join(r"c:\Antigravity\Cafe\addadotcom\docs\screenshots", fname))

print("All screenshots generated successfully.")
