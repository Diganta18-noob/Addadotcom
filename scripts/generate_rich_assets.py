import os
from PIL import Image, ImageDraw, ImageFont

# Path setup
base_dir = r"c:\Antigravity\Cafe\addadotcom"
public_dir = os.path.join(base_dir, "public")
docs_screenshots_dir = os.path.join(base_dir, "docs", "screenshots")

os.makedirs(public_dir, exist_ok=True)
os.makedirs(docs_screenshots_dir, exist_ok=True)

# Helper function for fonts
def get_font(size=16, bold=False):
    try:
        font_name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(font_name, size)
    except Exception:
        return ImageFont.load_default()

# ─── 1. Generate High-Res Logo ───────────────────────────────
def generate_logo():
    W, H = 512, 512
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Outer circle with golden metallic gradient style
    draw.ellipse([16, 16, 496, 496], fill=(18, 18, 22, 255), outline=(212, 160, 86, 255), width=10)
    draw.ellipse([32, 32, 480, 480], fill=None, outline=(75, 46, 43, 255), width=4)
    draw.ellipse([40, 40, 472, 472], fill=(28, 22, 20, 255))

    # Glowing center circle
    draw.ellipse([100, 100, 412, 412], fill=(42, 30, 26, 255), outline=(212, 160, 86, 255), width=4)

    # Stylized Coffee Cup Body
    draw.rounded_rectangle([170, 210, 330, 320], radius=24, fill=(212, 160, 86, 255))
    # Cup handle
    draw.arc([310, 225, 375, 305], start=270, end=90, fill=(212, 160, 86, 255), width=14)

    # Coffee steam digital dots
    draw.ellipse([210, 150, 230, 170], fill=(245, 230, 210, 255))
    draw.ellipse([250, 130, 270, 150], fill=(245, 230, 210, 255))
    draw.ellipse([290, 150, 310, 170], fill=(245, 230, 210, 255))

    # Text branding
    font_bold = get_font(36, bold=True)
    draw.text((256, 365), "AddaDotCom", fill=(255, 255, 255, 255), font=font_bold, anchor="mm")
    
    font_sub = get_font(18, bold=True)
    draw.text((256, 405), "POS & KITCHEN SYSTEM", fill=(212, 160, 86, 255), font=font_sub, anchor="mm")

    img.save(os.path.join(public_dir, "logo.png"))
    print("[OK] Logo generated: public/logo.png")

# ─── 2. Base UI Canvas Drawer ────────────────────────────────
def create_base_canvas(title, path_url):
    W, H = 1280, 720
    img = Image.new('RGB', (W, H), (11, 12, 16)) # #0B0C10
    draw = ImageDraw.Draw(img)

    # Browser Top Chrome
    draw.rectangle([0, 0, W, 50], fill=(18, 20, 26))
    draw.line([0, 50, W, 50], fill=(40, 44, 55), width=1)

    # Window control dots
    draw.ellipse([18, 18, 30, 30], fill=(239, 68, 68)) # Red
    draw.ellipse([38, 18, 50, 30], fill=(245, 158, 11)) # Yellow
    draw.ellipse([58, 18, 70, 30], fill=(16, 185, 129)) # Green

    # Address bar
    draw.rounded_rectangle([100, 10, 800, 40], radius=6, fill=(28, 32, 42), outline=(50, 55, 70), width=1)
    font_addr = get_font(13)
    draw.text((120, 25), f"https://addadotcom.vercel.app{path_url}", fill=(180, 190, 210), font=font_addr, anchor="lm")

    # Navbar line inside app
    draw.rectangle([0, 51, W, 105], fill=(15, 17, 23))
    draw.line([0, 105, W, 105], fill=(35, 40, 50), width=1)

    # App Logo in nav
    draw.ellipse([30, 67, 57, 94], fill=(212, 160, 86))
    font_nav_logo = get_font(20, bold=True)
    draw.text((68, 80), "AddaDotCom", fill=(255, 255, 255), font=font_nav_logo, anchor="lm")

    # Nav Links
    font_nav = get_font(14)
    links = [("Menu", 250), ("Order Track", 340), ("Reservations", 460), ("Admin Portal", 1160)]
    for text, pos in links:
        color = (212, 160, 86) if text == "Admin Portal" else (180, 190, 210)
        draw.text((pos, 80), text, fill=color, font=font_nav, anchor="lm")

    return img, draw, W, H

# ─── Screenshot 1: Homepage ──────────────────────────────────
def make_homepage():
    img, draw, W, H = create_base_canvas("Homepage", "/")
    
    # Hero Title
    font_hero = get_font(34, bold=True)
    draw.text((640, 160), "Enterprise-Grade Café & POS Platform", fill=(255, 255, 255), font=font_hero, anchor="mm")
    
    font_sub = get_font(16)
    draw.text((640, 205), "Production-ready ordering, real-time KDS kitchen stream, table QR & instant GST billing", fill=(160, 170, 190), font=font_sub, anchor="mm")

    # Action Buttons
    draw.rounded_rectangle([480, 235, 620, 275], radius=6, fill=(212, 160, 86))
    font_btn = get_font(15, bold=True)
    draw.text((550, 255), "Explore Menu", fill=(15, 15, 15), font=font_btn, anchor="mm")

    draw.rounded_rectangle([640, 235, 800, 275], radius=6, fill=(28, 34, 46), outline=(60, 70, 90), width=1)
    draw.text((720, 255), "Admin Dashboard", fill=(220, 230, 245), font=font_btn, anchor="mm")

    # Feature Cards (3 Columns)
    cards = [
        ("🍽 Contactless QR Ordering", "Scan table QR code to browse visual menu, customize addons, and place instant orders directly from table."),
        ("👨‍🍳 Kitchen Display (KDS)", "Sub-second order dispatch via Server-Sent Events (SSE), color-coded timers, audio alerts & single-tap bump."),
        ("📊 POS & GST Billing", "Table floor manager, split payments, instant PDF tax invoice generation, and financial revenue heatmaps.")
    ]
    
    col_w = 360
    for i, (title, desc) in enumerate(cards):
        x = 60 + i * (col_w + 30)
        y = 310
        draw.rounded_rectangle([x, y, x + col_w, y + 250], radius=10, fill=(20, 24, 33), outline=(45, 52, 68), width=1)
        
        # Header banner inside card
        draw.rounded_rectangle([x, y, x + col_w, y + 55], radius=10, fill=(30, 36, 50))
        draw.rectangle([x, y + 45, x + col_w, y + 55], fill=(30, 36, 50))
        font_ctitle = get_font(17, bold=True)
        draw.text((x + 20, y + 28), title, fill=(212, 160, 86), font=font_ctitle, anchor="lm")
        
        font_cdesc = get_font(13)
        # Wrap text manually
        words = desc.split()
        lines, current = [], ""
        for w in words:
            if len(current + " " + w) > 38:
                lines.append(current)
                current = w
            else:
                current = (current + " " + w).strip()
        lines.append(current)

        for ly, line in enumerate(lines):
            draw.text((x + 20, y + 80 + ly * 22), line, fill=(180, 190, 205), font=font_cdesc)

    # Metrics Counter Banner at bottom
    draw.rounded_rectangle([60, 590, W - 60, 680], radius=10, fill=(18, 22, 30), outline=(212, 160, 86), width=1)
    metrics = [
        ("⚡ <500ms", "SSE KDS Latency"),
        ("🧾 GSTIN 100%", "PDF Tax Invoices"),
        ("🏆 Loyalty Engine", "10 Points / ₹100"),
        ("🔒 NextAuth v4", "Role-Based Access")
    ]
    mw = (W - 120) // 4
    for i, (val, lbl) in enumerate(metrics):
        mx = 60 + i * mw + mw // 2
        font_val = get_font(20, bold=True)
        font_lbl = get_font(13)
        draw.text((mx, 620), val, fill=(212, 160, 86), font=font_val, anchor="mm")
        draw.text((mx, 650), lbl, fill=(160, 170, 190), font=font_lbl, anchor="mm")

    img.save(os.path.join(docs_screenshots_dir, "homepage.png"))
    print("[OK] Created: docs/screenshots/homepage.png")

# ─── Screenshot 2: Menu Page ─────────────────────────────────
def make_menu():
    img, draw, W, H = create_base_canvas("Menu", "/menu")

    # Search & Category Filters
    draw.rounded_rectangle([60, 125, 400, 165], radius=6, fill=(22, 26, 36), outline=(45, 52, 68), width=1)
    font_txt = get_font(14)
    draw.text((80, 145), "🔍 Search menu (e.g. Cappuccino, Pizza)...", fill=(120, 130, 150), font=font_txt, anchor="lm")

    cats = [("All Items", True), ("☕ Coffee", False), ("🍕 Artisanal Pizza", False), ("🍔 Burgers", False), ("🍰 Desserts", False)]
    cx = 420
    for cat_name, is_active in cats:
        bg = (212, 160, 86) if is_active else (25, 30, 42)
        fg = (15, 15, 15) if is_active else (180, 190, 210)
        draw.rounded_rectangle([cx, 125, cx + 120, 165], radius=6, fill=bg)
        draw.text((cx + 60, 145), cat_name, fill=fg, font=get_font(13, bold=is_active), anchor="mm")
        cx += 130

    # Menu Cards Grid (6 Items)
    items = [
        ("Artisanal Cappuccino", "Double shot espresso with steamed velvety milk", "₹180", "VEG"),
        ("Truffle Mushroom Pizza", "Wild mushrooms, truffle oil, mozzarella", "₹490", "VEG"),
        ("Smoked Chicken Panini", "Grilled chicken, pesto, melted provolone", "₹380", "NON-VEG"),
        ("Iced Spanish Latte", "Espresso, condensed milk, cinnamon dust", "₹220", "VEG"),
        ("Classic Burrata Salad", "Fresh burrata, heirloom tomatoes, basil", "₹420", "VEG"),
        ("Belgian Waffle Delight", "Warm waffle, dark chocolate, vanilla cream", "₹290", "VEG")
    ]

    card_w = 260
    for i, (name, desc, price, tag) in enumerate(items):
        col = i % 3
        row = i // 3
        x = 60 + col * (card_w + 25)
        y = 190 + row * 240

        draw.rounded_rectangle([x, y, x + card_w, y + 220], radius=8, fill=(20, 24, 33), outline=(40, 46, 60), width=1)
        
        # Image placeholder banner
        img_bg = (40, 30, 25) if "Coffee" in name or "Latte" in name else (30, 35, 45)
        draw.rounded_rectangle([x + 10, y + 10, x + card_w - 10, y + 90], radius=6, fill=img_bg)
        
        # Tag badge (VEG / NON-VEG)
        tag_bg = (16, 185, 129) if tag == "VEG" else (239, 68, 68)
        draw.rounded_rectangle([x + 15, y + 15, x + 65, y + 33], radius=4, fill=tag_bg)
        draw.text((x + 40, y + 24), tag, fill=(255, 255, 255), font=get_font(10, bold=True), anchor="mm")

        draw.text((x + 15, y + 110), name, fill=(255, 255, 255), font=get_font(15, bold=True))
        draw.text((x + 15, y + 135), desc[:32] + "...", fill=(150, 160, 180), font=get_font(12))
        
        draw.text((x + 15, y + 185), price, fill=(212, 160, 86), font=get_font(18, bold=True))
        
        # Add button
        draw.rounded_rectangle([x + card_w - 90, y + 170, x + card_w - 15, y + 205], radius=6, fill=(212, 160, 86))
        draw.text((x + card_w - 52, y + 187), "+ Add", fill=(15, 15, 15), font=get_font(13, bold=True), anchor="mm")

    # Slide-over Cart Drawer (Right Side)
    draw.rectangle([W - 350, 106, W, H], fill=(16, 19, 26))
    draw.line([W - 350, 106, W - 350, H], fill=(50, 58, 75), width=2)
    
    draw.text((W - 330, 135), "🛒 Your Cart (2 Items)", fill=(255, 255, 255), font=get_font(18, bold=True))
    draw.text((W - 330, 160), "Table #04 (Dine-In)", fill=(212, 160, 86), font=get_font(13))

    cart_items = [
        ("1x Artisanal Cappuccino", "Large · Extra Shot", "₹210"),
        ("1x Truffle Mushroom Pizza", "Regular Crust", "₹490")
    ]
    cy = 195
    for cname, copt, cprice in cart_items:
        draw.rounded_rectangle([W - 330, cy, W - 20, cy + 65], radius=6, fill=(24, 28, 38))
        draw.text((W - 315, cy + 20), cname, fill=(230, 235, 245), font=get_font(14, bold=True))
        draw.text((W - 315, cy + 42), copt, fill=(140, 150, 170), font=get_font(12))
        draw.text((W - 40, cy + 32), cprice, fill=(212, 160, 86), font=get_font(14, bold=True), anchor="rm")
        cy += 75

    # Cart Summary
    draw.line([W - 330, 530, W - 20, 530], fill=(45, 52, 68), width=1)
    draw.text((W - 330, 550), "Subtotal:", fill=(160, 170, 190), font=get_font(14))
    draw.text((W - 20, 550), "₹700.00", fill=(255, 255, 255), font=get_font(14, bold=True), anchor="rm")
    
    draw.text((W - 330, 575), "GST (5%):", fill=(160, 170, 190), font=get_font(14))
    draw.text((W - 20, 575), "₹35.00", fill=(255, 255, 255), font=get_font(14, bold=True), anchor="rm")

    draw.text((W - 330, 610), "Total Payable:", fill=(212, 160, 86), font=get_font(16, bold=True))
    draw.text((W - 20, 610), "₹735.00", fill=(212, 160, 86), font=get_font(18, bold=True), anchor="rm")

    # Checkout CTA
    draw.rounded_rectangle([W - 330, 645, W - 20, 695], radius=8, fill=(212, 160, 86))
    draw.text((W - 175, 670), "Proceed to Checkout →", fill=(15, 15, 15), font=get_font(16, bold=True), anchor="mm")

    img.save(os.path.join(docs_screenshots_dir, "menu.png"))
    print("[OK] Created: docs/screenshots/menu.png")

# ─── Screenshot 3: Order Tracker ─────────────────────────────
def make_tracker():
    img, draw, W, H = create_base_canvas("Order Tracker", "/track/ORD-8492")

    # Card Container
    draw.rounded_rectangle([140, 130, W - 140, 680], radius=12, fill=(20, 24, 33), outline=(45, 52, 68), width=1)

    # Header inside tracker card
    draw.text((180, 170), "Live Order Tracker", fill=(255, 255, 255), font=get_font(24, bold=True))
    draw.text((180, 205), "Order #ORD-8492 · Table #04 (Dine-In) · Real-Time SSE Status Stream", fill=(160, 170, 190), font=get_font(14))

    # Stepper Progress Bar (4 Steps)
    steps = [
        ("Order Placed", "19:02", True, True),
        ("Kitchen Accepted", "19:03", True, True),
        ("Preparing 🍳", "Current (ETA 8m)", True, False),
        ("Ready to Serve", "Pending", False, False)
    ]

    sx = 220
    step_w = 220
    for i, (stitle, stime, is_done, is_past) in enumerate(steps):
        x = sx + i * step_w
        y = 280

        # Line connecting nodes
        if i < 3:
            line_color = (212, 160, 86) if is_past else (50, 58, 75)
            draw.line([x + 20, y, x + step_w - 20, y], fill=line_color, width=4)

        # Circle node
        bg_color = (212, 160, 86) if is_done else (40, 46, 60)
        draw.ellipse([x - 18, y - 18, x + 18, y + 18], fill=bg_color)
        icon = "[OK]" if is_past else (str(i + 1))
        draw.text((x, y), icon, fill=(15, 15, 15) if is_done else (180, 190, 210), font=get_font(14, bold=True), anchor="mm")

        # Step Label
        draw.text((x, y + 35), stitle, fill=(255, 255, 255) if is_done else (140, 150, 170), font=get_font(14, bold=True), anchor="mm")
        draw.text((x, y + 58), stime, fill=(212, 160, 86) if "Current" in stime else (140, 150, 170), font=get_font(12), anchor="mm")

    # Order details section
    draw.line([180, 410, W - 180, 410], fill=(45, 52, 68), width=1)

    draw.text((180, 435), "📦 Order Summary", fill=(212, 160, 86), font=get_font(16, bold=True))

    summary_items = [
        ("2x Artisanal Cappuccino (Large)", "Extra Shot, Almond Milk", "₹420.00"),
        ("1x Truffle Mushroom Pizza", "Thin Crust, Extra Cheese", "₹490.00"),
        ("1x Chocolate Lava Cake", "Warm with Vanilla Ice Cream", "₹240.00")
    ]
    sy = 475
    for iname, iopt, iprice in summary_items:
        draw.text((180, sy), iname, fill=(230, 235, 245), font=get_font(14, bold=True))
        draw.text((180, sy + 20), iopt, fill=(140, 150, 170), font=get_font(12))
        draw.text((W - 180, sy + 10), iprice, fill=(255, 255, 255), font=get_font(14, bold=True), anchor="rm")
        sy += 55

    # Bottom Actions
    draw.line([180, 630, W - 180, 630], fill=(45, 52, 68), width=1)
    
    draw.rounded_rectangle([180, 642, 360, 672], radius=6, fill=(28, 34, 46), outline=(212, 160, 86), width=1)
    draw.text((270, 657), "📄 Download Invoice", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="mm")

    draw.text((W - 180, 657), "Earned +115 Loyalty Points 🏆", fill=(16, 185, 129), font=get_font(14, bold=True), anchor="rm")

    img.save(os.path.join(docs_screenshots_dir, "tracker.png"))
    print("[OK] Created: docs/screenshots/tracker.png")

# ─── Screenshot 4: Kitchen KDS ───────────────────────────────
def make_kds():
    img, draw, W, H = create_base_canvas("Kitchen Display System", "/admin/kitchen")

    # KDS Sub-bar
    draw.rectangle([0, 106, W, 150], fill=(20, 22, 30))
    draw.line([0, 150, W, 150], fill=(45, 52, 68), width=1)

    draw.text((40, 128), "🖥 Kitchen Station KDS (Fullscreen Mode)", fill=(255, 255, 255), font=get_font(16, bold=True), anchor="lm")

    draw.rounded_rectangle([W - 340, 115, W - 200, 142], radius=4, fill=(16, 185, 129))
    draw.text((W - 270, 1285//10), "● SSE Connected", fill=(255, 255, 255), font=get_font(12, bold=True), anchor="mm")

    draw.rounded_rectangle([W - 180, 115, W - 40, 142], radius=4, fill=(28, 34, 46), outline=(60, 70, 90), width=1)
    draw.text((W - 110, 1285//10), "🔊 Chime: ON", fill=(212, 160, 86), font=get_font(12, bold=True), anchor="mm")

    # KDS Active Tickets Grid (3 Cards)
    tickets = [
        ("🚨 Ticket #ORD-8490", "Table #02 · Dine-In", "18 mins ago", (239, 68, 68), [
            ("2x Truffle Mushroom Pizza", "Extra Truffle Oil"),
            ("1x Iced Spanish Latte", "Double Shot"),
            ("1x Garlic Bread Supreme", "Extra Cheese")
        ]),
        ("⏳ Ticket #ORD-8491", "Table #05 · Takeaway", "9 mins ago", (245, 158, 11), [
            ("1x Smoked Chicken Panini", "No Onion"),
            ("2x Artisanal Cappuccino", "Almond Milk"),
            ("1x Chocolate Lava Cake", "Hot")
        ]),
        ("✅ Ticket #ORD-8492", "Table #04 · Dine-In", "2 mins ago", (16, 185, 129), [
            ("2x Cold Brew Float", "Vanilla Scoop"),
            ("1x Classic Burrata Salad", "Dressing on side"),
            ("1x Avocado Toast", "Poached Egg")
        ])
    ]

    card_w = 370
    for i, (tnum, ttable, ttime, tcolor, titems) in enumerate(tickets):
        x = 40 + i * (card_w + 35)
        y = 170

        draw.rounded_rectangle([x, y, x + card_w, y + 430], radius=8, fill=(18, 22, 30), outline=tcolor, width=2)

        # Header banner inside ticket
        draw.rounded_rectangle([x, y, x + card_w, y + 55], radius=8, fill=tcolor)
        draw.rectangle([x, y + 45, x + card_w, y + 55], fill=tcolor)
        
        draw.text((x + 15, y + 28), tnum, fill=(255, 255, 255), font=get_font(16, bold=True), anchor="lm")
        draw.text((x + card_w - 15, y + 28), ttime, fill=(255, 255, 255), font=get_font(13, bold=True), anchor="rm")

        draw.text((x + 15, y + 75), ttable, fill=(212, 160, 86), font=get_font(14, bold=True))
        draw.line([x + 15, y + 95, x + card_w - 15, y + 95], fill=(45, 52, 68), width=1)

        iy = y + 115
        for iname, iopt in titems:
            draw.text((x + 15, iy), iname, fill=(240, 245, 255), font=get_font(15, bold=True))
            draw.text((x + 15, iy + 22), f"• {iopt}", fill=(160, 170, 190), font=get_font(12))
            iy += 60

        # Bump Order Button at bottom
        draw.rounded_rectangle([x + 15, y + 365, x + card_w - 15, y + 410], radius=6, fill=tcolor)
        draw.text((x + card_w // 2, y + 387), "BUMP TICKET [OK]", fill=(255, 255, 255), font=get_font(15, bold=True), anchor="mm")

    # Item Aggregator Banner at Bottom
    draw.rounded_rectangle([40, 620, W - 40, 695], radius=8, fill=(22, 26, 36), outline=(212, 160, 86), width=1)
    draw.text((60, 640), "📊 Kitchen Aggregator (Consolidated Cooking Load):", fill=(212, 160, 86), font=get_font(14, bold=True))
    draw.text((60, 668), "• 2x Truffle Mushroom Pizza   • 4x Artisanal Cappuccino   • 2x Cold Brew Float   • 1x Panini", fill=(220, 230, 245), font=get_font(13))

    img.save(os.path.join(docs_screenshots_dir, "kds.png"))
    print("[OK] Created: docs/screenshots/kds.png")

# ─── Screenshot 5: Admin POS Billing ─────────────────────────
def make_billing():
    img, draw, W, H = create_base_canvas("Admin POS Billing", "/admin/billing")

    # Left: Active Tables Selector (Width 400)
    draw.rectangle([0, 106, 380, H], fill=(16, 19, 26))
    draw.line([380, 106, 380, H], fill=(45, 52, 68), width=2)

    draw.text((20, 135), "🗺 Select Table to Bill", fill=(255, 255, 255), font=get_font(16, bold=True))

    tables_pos = [
        ("Table 01", "FREE", (16, 185, 129)),
        ("Table 02", "OCCUPIED", (239, 68, 68)),
        ("Table 03", "RESERVED", (245, 158, 11)),
        ("Table 04", "BILL REQ", (159, 122, 234)),
        ("Table 05", "OCCUPIED", (239, 68, 68)),
        ("Table 06", "FREE", (16, 185, 129))
    ]

    for i, (tname, tstat, tcol) in enumerate(tables_pos):
        col = i % 2
        row = i // 2
        tx = 20 + col * 170
        ty = 170 + row * 85
        
        is_sel = (tname == "Table 04")
        bg_col = (30, 36, 50) if is_sel else (22, 26, 36)
        out_col = (212, 160, 86) if is_sel else (45, 52, 68)

        draw.rounded_rectangle([tx, ty, tx + 155, ty + 70], radius=6, fill=bg_col, outline=out_col, width=2 if is_sel else 1)
        draw.text((tx + 12, ty + 25), tname, fill=(255, 255, 255), font=get_font(14, bold=True))
        
        draw.rounded_rectangle([tx + 12, ty + 42, tx + 100, ty + 60], radius=3, fill=tcol)
        draw.text((tx + 56, ty + 51), tstat, fill=(255, 255, 255), font=get_font(10, bold=True), anchor="mm")

    # Right: Bill Breakdown & POS Settlement (Width 860)
    rx = 410
    draw.text((rx, 135), "🧾 Bill Generation — Table #04", fill=(255, 255, 255), font=get_font(20, bold=True))
    draw.text((rx, 165), "Cashier: Admin (admin@addadotcom.cafe) · Date: 25-JUL-2026", fill=(160, 170, 190), font=get_font(13))

    # Itemized Table Header
    draw.rounded_rectangle([rx, 195, W - 40, 235], radius=6, fill=(26, 32, 44))
    draw.text((rx + 20, 215), "Item Description", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="lm")
    draw.text((rx + 450, 215), "Qty", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="mm")
    draw.text((rx + 580, 215), "Rate", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="mm")
    draw.text((W - 60, 215), "Amount", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="rm")

    bitems = [
        ("Artisanal Cappuccino (Large)", "2", "₹210.00", "₹420.00"),
        ("Truffle Mushroom Pizza", "1", "₹490.00", "₹490.00"),
        ("Chocolate Lava Cake", "1", "₹240.00", "₹240.00")
    ]

    by = 250
    for biname, biqty, birate, biamt in bitems:
        draw.text((rx + 20, by), biname, fill=(230, 235, 245), font=get_font(14))
        draw.text((rx + 450, by), biqty, fill=(200, 210, 225), font=get_font(14), anchor="mm")
        draw.text((rx + 580, by), birate, fill=(200, 210, 225), font=get_font(14), anchor="mm")
        draw.text((W - 60, by), biamt, fill=(255, 255, 255), font=get_font(14, bold=True), anchor="rm")
        by += 40

    draw.line([rx, by + 10, W - 40, by + 10], fill=(45, 52, 68), width=1)

    # Tax & Calculation Breakdown
    calc_y = by + 25
    calcs = [
        ("Subtotal:", "₹1,150.00"),
        ("CGST (2.5%):", "₹28.75"),
        ("SGST (2.5%):", "₹28.75"),
        ("Service Charge (5%):", "₹57.50"),
        ("Grand Total:", "₹1,265.00")
    ]

    for clbl, cval in calcs:
        font_c = get_font(15, bold=("Grand" in clbl))
        color_c = (212, 160, 86) if "Grand" in clbl else (180, 190, 210)
        draw.text((W - 300, calc_y), clbl, fill=color_c, font=font_c)
        draw.text((W - 60, calc_y), cval, fill=color_c, font=font_c, anchor="rm")
        calc_y += 32

    # Payment Execution Block
    draw.rounded_rectangle([rx, calc_y + 10, W - 40, H - 30], radius=8, fill=(22, 28, 38), outline=(212, 160, 86), width=1)
    
    draw.text((rx + 20, calc_y + 35), "💳 Execute Payment Method:", fill=(255, 255, 255), font=get_font(15, bold=True))

    pmethods = [("💵 Cash", False), ("💳 Card", False), ("📲 UPI / QR", True), ("🔀 Split Pay", False)]
    pm_x = rx + 260
    for ptext, psel in pmethods:
        pbg = (212, 160, 86) if psel else (32, 38, 52)
        pfg = (15, 15, 15) if psel else (200, 210, 225)
        draw.rounded_rectangle([pm_x, calc_y + 20, pm_x + 100, calc_y + 55], radius=6, fill=pbg)
        draw.text((pm_x + 50, calc_y + 37), ptext, fill=pfg, font=get_font(12, bold=psel), anchor="mm")
        pm_x += 110

    # Print & Settle CTA Button
    draw.rounded_rectangle([rx + 20, calc_y + 75, W - 60, calc_y + 115], radius=6, fill=(16, 185, 129))
    draw.text((rx + (W - 40 - rx) // 2, calc_y + 95), "PRINT INVOICE & SETTLE BILL (₹1,265.00) [OK]", fill=(255, 255, 255), font=get_font(16, bold=True), anchor="mm")

    img.save(os.path.join(docs_screenshots_dir, "billing.png"))
    print("[OK] Created: docs/screenshots/billing.png")

# ─── Screenshot 6: Analytics ─────────────────────────────────
def make_analytics():
    img, draw, W, H = create_base_canvas("Analytics Dashboard", "/admin/analytics")

    # Metric Cards Top Row (4 Cards)
    mcards = [
        ("Today's Revenue", "₹48,250", "+18.4% WoW", (16, 185, 129)),
        ("Total Orders", "142 Orders", "Peak 1:00 PM", (212, 160, 86)),
        ("Average Order (AOV)", "₹340.00", "+₹25 vs Avg", (59, 130, 246)),
        ("Table Occupancy", "83% Rate", "10 / 12 Active", (159, 122, 234))
    ]

    card_w = 270
    for i, (mtitle, mval, msub, mcol) in enumerate(mcards):
        x = 40 + i * (card_w + 30)
        y = 125

        draw.rounded_rectangle([x, y, x + card_w, y + 105], radius=8, fill=(20, 24, 33), outline=(45, 52, 68), width=1)
        draw.text((x + 15, y + 25), mtitle, fill=(160, 170, 190), font=get_font(13))
        draw.text((x + 15, y + 55), mval, fill=(255, 255, 255), font=get_font(22, bold=True))
        draw.text((x + 15, y + 85), msub, fill=mcol, font=get_font(12, bold=True))

    # Revenue Curve Graph Box (Left Side)
    gx, gy, gw, gh = 40, 255, 780, 430
    draw.rounded_rectangle([gx, gy, gx + gw, gy + gh], radius=8, fill=(20, 24, 33), outline=(45, 52, 68), width=1)

    draw.text((gx + 20, gy + 25), "📈 Hourly Revenue Trend (Today)", fill=(255, 255, 255), font=get_font(16, bold=True))

    # Draw Chart Grid & Polyline
    chart_pts = [(gx + 50, gy + 350), (gx + 140, gy + 320), (gx + 230, gy + 290), 
                 (gx + 320, gy + 160), (gx + 410, gy + 220), (gx + 500, gy + 180),
                 (gx + 590, gy + 120), (gx + 680, gy + 260), (gx + 740, gy + 190)]

    for pt in range(1, len(chart_pts)):
        draw.line([chart_pts[pt-1], chart_pts[pt]], fill=(212, 160, 86), width=4)

    for px, py in chart_pts:
        draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(212, 160, 86), outline=(255, 255, 255), width=2)

    # Peak Hours Heatmap Box (Right Side)
    hx, hy, hw, hh = 850, 255, 390, 430
    draw.rounded_rectangle([hx, hy, hx + hw, hy + hh], radius=8, fill=(20, 24, 33), outline=(45, 52, 68), width=1)

    draw.text((hx + 20, hy + 25), "🔥 Category Sales Share", fill=(255, 255, 255), font=get_font(16, bold=True))

    cat_shares = [
        ("Specialty Coffee", "38%", 0.38, (212, 160, 86)),
        ("Artisanal Pizza", "29%", 0.29, (59, 130, 246)),
        ("Breakfast & Toast", "18%", 0.18, (16, 185, 129)),
        ("Desserts & Shakes", "15%", 0.15, (239, 68, 68))
    ]
    cs_y = hy + 75
    for cname, cperc, cratio, ccolor in cat_shares:
        draw.text((hx + 20, cs_y), cname, fill=(230, 235, 245), font=get_font(14))
        draw.text((hx + hw - 20, cs_y), cperc, fill=ccolor, font=get_font(14, bold=True), anchor="rm")
        
        # Progress Bar
        draw.rounded_rectangle([hx + 20, cs_y + 25, hx + hw - 20, cs_y + 37], radius=4, fill=(35, 42, 56))
        draw.rounded_rectangle([hx + 20, cs_y + 25, hx + 20 + int((hw - 40) * cratio), cs_y + 37], radius=4, fill=ccolor)
        cs_y += 75

    img.save(os.path.join(docs_screenshots_dir, "analytics.png"))
    print("[OK] Created: docs/screenshots/analytics.png")

# ─── Screenshot 7: Digital Tax Invoice ───────────────────────
def make_invoice():
    img, draw, W, H = create_base_canvas("Digital Tax Invoice", "/invoice/INV-2026-08492")

    # Paper Invoice Sheet Centered
    pw, ph = 640, 580
    px, py = (W - pw) // 2, 115
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=8, fill=(22, 26, 36), outline=(212, 160, 86), width=2)

    # Cafe Header
    draw.text((px + 30, py + 35), "ADDA.COM CAFES PVT LTD", fill=(255, 255, 255), font=get_font(20, bold=True))
    draw.text((px + 30, py + 65), "GSTIN: 27AAAAA0000A1Z5 · FSSAI Lic: 11521000000000", fill=(160, 170, 190), font=get_font(12))
    draw.text((px + 30, py + 85), "123 MG Road, Connaught Place, New Delhi 110001", fill=(160, 170, 190), font=get_font(12))

    draw.text((px + pw - 30, py + 35), "TAX INVOICE", fill=(212, 160, 86), font=get_font(20, bold=True), anchor="rm")
    draw.text((px + pw - 30, py + 65), "INV-2026-08492", fill=(255, 255, 255), font=get_font(14, bold=True), anchor="rm")

    draw.line([px + 30, py + 115, px + pw - 30, py + 115], fill=(45, 52, 68), width=1)

    # Item Table
    draw.text((px + 30, py + 135), "Item", fill=(212, 160, 86), font=get_font(13, bold=True))
    draw.text((px + 320, py + 135), "Qty", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="mm")
    draw.text((px + 430, py + 135), "Rate", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="mm")
    draw.text((px + pw - 30, py + 135), "Amount", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="rm")

    in_items = [
        ("Artisanal Cappuccino", "2", "₹180.00", "₹360.00"),
        ("Truffle Mushroom Pizza", "1", "₹490.00", "₹490.00"),
        ("Chocolate Lava Cake", "1", "₹240.00", "₹240.00")
    ]
    iy = py + 165
    for iname, iqty, irate, iamt in in_items:
        draw.text((px + 30, iy), iname, fill=(230, 235, 245), font=get_font(13))
        draw.text((px + 320, iy), iqty, fill=(200, 210, 225), font=get_font(13), anchor="mm")
        draw.text((px + 430, iy), irate, fill=(200, 210, 225), font=get_font(13), anchor="mm")
        draw.text((px + pw - 30, iy), iamt, fill=(255, 255, 255), font=get_font(13, bold=True), anchor="rm")
        iy += 32

    draw.line([px + 30, iy + 10, px + pw - 30, iy + 10], fill=(45, 52, 68), width=1)

    # Tax Summary
    ty = iy + 25
    draw.text((px + 300, ty), "Taxable Amount:", fill=(160, 170, 190), font=get_font(13))
    draw.text((px + pw - 30, ty), "₹1,090.00", fill=(255, 255, 255), font=get_font(13, bold=True), anchor="rm")

    draw.text((px + 300, ty + 25), "CGST @ 2.5%:", fill=(160, 170, 190), font=get_font(13))
    draw.text((px + pw - 30, ty + 25), "₹27.25", fill=(255, 255, 255), font=get_font(13, bold=True), anchor="rm")

    draw.text((px + 300, ty + 50), "SGST @ 2.5%:", fill=(160, 170, 190), font=get_font(13))
    draw.text((px + pw - 30, ty + 50), "₹27.25", fill=(255, 255, 255), font=get_font(13, bold=True), anchor="rm")

    draw.text((px + 300, ty + 80), "Total Amount Paid:", fill=(212, 160, 86), font=get_font(15, bold=True))
    draw.text((px + pw - 30, ty + 80), "₹1,144.50", fill=(212, 160, 86), font=get_font(16, bold=True), anchor="rm")

    # QR Verification Block
    draw.rounded_rectangle([px + 30, ty + 40, px + 140, ty + 150], radius=6, fill=(255, 255, 255))
    # Simulated QR Pattern
    qdraw = ImageDraw.Draw(img)
    for qx in range(px + 40, px + 130, 10):
        for qy in range(ty + 50, ty + 140, 10):
            if (qx + qy) % 20 == 0:
                qdraw.rectangle([qx, qy, qx + 8, qy + 8], fill=(0, 0, 0))

    draw.text((px + 150, ty + 120), "Scan QR to verify invoice authenticity", fill=(140, 150, 170), font=get_font(11))

    img.save(os.path.join(docs_screenshots_dir, "invoice.png"))
    print("[OK] Created: docs/screenshots/invoice.png")

# ─── Screenshot 8: Table Floor Plan ──────────────────────────
def make_tables():
    img, draw, W, H = create_base_canvas("Table Floor Plan", "/admin/tables")

    # Zone Filter Pills
    draw.text((40, 135), "🗺 Visual Table Floor Manager", fill=(255, 255, 255), font=get_font(20, bold=True))

    zones = [("Indoor Main", True), ("Outdoor Patio", False), ("Terrace Lounge", False)]
    zx = 380
    for zname, zis_act in zones:
        zbg = (212, 160, 86) if zis_act else (28, 34, 46)
        zfg = (15, 15, 15) if zis_act else (180, 190, 210)
        draw.rounded_rectangle([zx, 122, zx + 130, 155], radius=6, fill=zbg)
        draw.text((zx + 65, 138), zname, fill=zfg, font=get_font(13, bold=zis_act), anchor="mm")
        zx += 140

    # 12 Tables Grid
    tgrid = [
        ("Table 01", "Cap: 2", "FREE 🟢", (16, 185, 129)),
        ("Table 02", "Cap: 4", "OCCUPIED 🔴", (239, 68, 68)),
        ("Table 03", "Cap: 4", "RESERVED 🟡", (245, 158, 11)),
        ("Table 04", "Cap: 6", "BILL REQ 🟣", (159, 122, 234)),
        ("Table 05", "Cap: 2", "OCCUPIED 🔴", (239, 68, 68)),
        ("Table 06", "Cap: 4", "FREE 🟢", (16, 185, 129)),
        ("Table 07", "Cap: 4", "FREE 🟢", (16, 185, 129)),
        ("Table 08", "Cap: 2", "OCCUPIED 🔴", (239, 68, 68))
    ]

    card_w = 270
    for i, (tname, tcap, tstat, tcol) in enumerate(tgrid):
        col = i % 4
        row = i // 4
        tx = 40 + col * (card_w + 30)
        ty = 180 + row * 240

        draw.rounded_rectangle([tx, ty, tx + card_w, ty + 210], radius=8, fill=(20, 24, 33), outline=tcol, width=2)

        draw.text((tx + 20, ty + 30), tname, fill=(255, 255, 255), font=get_font(18, bold=True))
        draw.text((tx + card_w - 20, ty + 30), tcap, fill=(160, 170, 190), font=get_font(13), anchor="rm")

        # Status Tag Box
        draw.rounded_rectangle([tx + 20, ty + 65, tx + 140, ty + 95], radius=4, fill=tcol)
        draw.text((tx + 80, ty + 80), tstat, fill=(255, 255, 255), font=get_font(12, bold=True), anchor="mm")

        # Action Buttons
        draw.rounded_rectangle([tx + 20, ty + 145, tx + card_w - 20, ty + 185], radius=6, fill=(28, 34, 46), outline=(60, 70, 90), width=1)
        draw.text((tx + card_w // 2, ty + 165), "🖨 Print QR Standee", fill=(212, 160, 86), font=get_font(13, bold=True), anchor="mm")

    img.save(os.path.join(docs_screenshots_dir, "tables.png"))
    print("[OK] Created: docs/screenshots/tables.png")

# ─── Screenshot 9: Contactless QR Order ──────────────────────
def make_qr():
    img, draw, W, H = create_base_canvas("Contactless QR Order", "/menu?table=4")

    # Mobile Phone Mockup Frame (Left)
    mx, my, mw, mh = 140, 120, 320, 570
    draw.rounded_rectangle([mx, my, mx + mw, my + mh], radius=32, fill=(18, 22, 30), outline=(212, 160, 86), width=4)

    # Mobile Notch
    draw.rounded_rectangle([mx + 100, my + 10, mx + 220, my + 30], radius=10, fill=(10, 12, 16))

    # Mobile Screen Content
    draw.text((mx + 160, my + 55), "AddaDotCom Menu", fill=(255, 255, 255), font=get_font(16, bold=True), anchor="mm")
    draw.text((mx + 160, my + 80), "Table #04 Auto-bound [OK]", fill=(16, 185, 129), font=get_font(12, bold=True), anchor="mm")

    # Mobile Item List
    mitems = [
        ("Cappuccino", "₹180"),
        ("Truffle Pizza", "₹490"),
        ("Spanish Latte", "₹220")
    ]
    msy = my + 115
    for miname, miprice in mitems:
        draw.rounded_rectangle([mx + 20, msy, mx + mw - 20, msy + 60], radius=6, fill=(28, 34, 46))
        draw.text((mx + 35, msy + 30), miname, fill=(240, 245, 255), font=get_font(13, bold=True), anchor="lm")
        draw.text((mx + mw - 35, msy + 30), miprice, fill=(212, 160, 86), font=get_font(13, bold=True), anchor="rm")
        msy += 75

    # Mobile CTA Button
    draw.rounded_rectangle([mx + 20, my + mh - 70, mx + mw - 20, my + mh - 20], radius=8, fill=(212, 160, 86))
    draw.text((mx + mw // 2, my + mh - 45), "Place Order (Table 04) →", fill=(15, 15, 15), font=get_font(14, bold=True), anchor="mm")

    # Printable Table QR Standee (Right)
    sx, sy, sw, sh = 560, 140, 580, 520
    draw.rounded_rectangle([sx, sy, sx + sw, sy + sh], radius=12, fill=(255, 255, 255), outline=(212, 160, 86), width=3)

    draw.text((sx + sw // 2, sy + 50), "ADDA.COM CAFÉ", fill=(15, 15, 15), font=get_font(24, bold=True), anchor="mm")
    draw.text((sx + sw // 2, sy + 85), "TABLE #04", fill=(212, 160, 86), font=get_font(28, bold=True), anchor="mm")

    # Big QR Box inside Standee
    qbox_x, qbox_y = sx + (sw - 220) // 2, sy + 120
    draw.rectangle([qbox_x, qbox_y, qbox_x + 220, qbox_y + 220], fill=(0, 0, 0))

    # Inner QR pattern
    sdraw = ImageDraw.Draw(img)
    for qx in range(qbox_x + 10, qbox_x + 210, 20):
        for qy in range(qbox_y + 10, qbox_y + 210, 20):
            if (qx * qy) % 3 == 0:
                sdraw.rectangle([qx, qy, qx + 15, qy + 15], fill=(255, 255, 255))

    draw.text((sx + sw // 2, sy + 380), "SCAN QR CODE TO ORDER & PAY", fill=(15, 15, 15), font=get_font(18, bold=True), anchor="mm")
    draw.text((sx + sw // 2, sy + 415), "No App Download Required · Sub-second KDS Dispatch", fill=(100, 110, 125), font=get_font(13), anchor="mm")

    img.save(os.path.join(docs_screenshots_dir, "qr.png"))
    print("[OK] Created: docs/screenshots/qr.png")

if __name__ == "__main__":
    generate_logo()
    print("[OK] Logo generated: public/logo.png")
    make_homepage()
    make_menu()
    make_tracker()
    make_kds()
    make_billing()
    make_analytics()
    make_invoice()
    make_tables()
    make_qr()
    print("[OK] All rich assets generated successfully.")
