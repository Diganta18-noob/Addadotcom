import os
import glob
from PIL import Image

assets = [
    {"name": "architecture-workflow", "fps": 25},
    {"name": "realtime-engine", "fps": 25},
    {"name": "quick-start-workflow", "fps": 25},
    {"name": "hero-banner", "fps": 20},
    {"name": "why-addadotcom", "fps": 20}
]

for asset in assets:
    name = asset["name"]
    fps = asset["fps"]
    duration = int(1000 / fps)
    
    frames_dir = os.path.abspath(f"temp_frames/{name}")
    frame_files = sorted(glob.glob(os.path.join(frames_dir, "frame_*.png")))
    
    if not frame_files:
        print(f"No frames found for {name}")
        continue
        
    print(f"Compiling {len(frame_files)} frames into docs/assets/{name}.gif ...")
    images = []

    # First image as base
    base_img = Image.open(frame_files[0]).convert("RGBA")
    
    for f in frame_files:
        img = Image.open(f).convert("RGBA")
        # Quantize with adaptive palette for crisp color reproduction
        quantized = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        images.append(quantized)
        
    out_gif = os.path.abspath(f"docs/assets/{name}.gif")
    images[0].save(
        out_gif,
        save_all=True,
        append_images=images[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    print(f"Saved {out_gif} ({os.path.getsize(out_gif) / 1024:.1f} KB)")
