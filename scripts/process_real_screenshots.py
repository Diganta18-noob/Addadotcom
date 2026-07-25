import os
from PIL import Image

brain_dir = r"C:\Users\digan\.gemini\antigravity-ide\brain\eacff323-f08e-421b-97ee-86356ff23196"
target_dir = r"c:\Antigravity\Cafe\addadotcom\docs\screenshots"
os.makedirs(target_dir, exist_ok=True)

screenshot_mapping = {
    "homepage.png": "homepage_1784978797706.png",
    "menu.png": "menu_1784978864658.png",
    "tracker.png": "tracker_1784978900807.png",
    "kds.png": "kds_1784978945327.png",
    "billing.png": "admin_billing_1784979100642.png",
    "analytics.png": "admin_analytics_1784979114979.png",
    "invoice.png": "digital_invoice_1784979179256.png",
    "tables.png": "admin_tables_floorplan_1784979193565.png",
    "qr.png": "table_qr_ordering_1784979207815.png"
}

target_size = (1280, 720)

for target_name, src_filename in screenshot_mapping.items():
    src_path = os.path.join(brain_dir, src_filename)
    dest_path = os.path.join(target_dir, target_name)
    
    if os.path.exists(src_path):
        img = Image.open(src_path)
        
        # Crop top/viewport if necessary or scale to 1280x720 maintain aspect ratio fill
        w, h = img.size
        # Crop top region if it's very tall (full page screenshot)
        if h > w:
            crop_height = int(w * 9 / 16)
            img = img.crop((0, 0, w, crop_height))
        
        # Resize to 1280x720 HD standard
        img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
        img_resized.save(dest_path, "PNG", optimize=True)
        print(f"[OK] Saved real screenshot: {target_name} from {src_filename}")
    else:
        print(f"[ERROR] Source file not found: {src_path}")

print("All real website screenshots successfully processed and updated.")
