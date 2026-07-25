import os
from PIL import Image, ImageDraw, ImageFont

# Directories
public_dir = r"c:\Antigravity\Cafe\addadotcom\public"
docs_screenshots_dir = r"c:\Antigravity\Cafe\addadotcom\docs\screenshots"

os.makedirs(public_dir, exist_ok=True)
os.makedirs(docs_screenshots_dir, exist_ok=True)

# Helper function to get default font
def get_font(size=18, bold=False):
    try:
        font_path = "arial.ttf" if not bold else "arialbd.ttf"
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

# 1. Create Logo (public/logo.png)
def create_logo():
    img = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background circle
    draw.ellipse([32, 32, 480, 480], fill=(28, 20, 18, 255), outline=(212, 160, 86, 255), width=8)
    
    # Inner glow accent
    draw.ellipse([64, 64, 448, 448], fill=None, outline=(75, 46, 43, 200), width=4)
    
    # Cup icon shape
    draw.rounded_rectangle([160, 200, 320, 320], radius=16, fill=(212, 160, 86, 255))
    draw.arc([310, 220, 370, 300], start=270, end=90, fill=(212, 160, 86, 255), width=12)
    
    # Digital steam dots
    draw.ellipse([200, 140, 220, 160], fill=(245, 230, 210, 255))
    draw.ellipse([250, 120, 270, 140], fill=(245, 230, 210, 255))
    draw.ellipse([300, 140, 320, 160], fill=(245, 230, 210, 255))

    # Text below
    font_bold = get_font(36, bold=True)
    draw.text((256, 370), "AddaDotCom", fill=(255, 255, 255, 255), font=font_bold, anchor="mm")
    
    font_sub = get_font(20)
    draw.text((256, 410), "ENTERPRISE POS", fill=(212, 160, 86, 255), font=font_sub, anchor="mm")

    img.save(os.path.join(public_dir, "logo.png"))
    print("Logo created: public/logo.png")

# Template builder for mock screenshots
def create_mockup(filename, title, subtitle, bg_color, card_colors, badges, details):
    W, H = 1200, 675
    img = Image.new('RGB', (W, H), bg_color)
    draw = ImageDraw.Draw(img)

    # Top Navbar Bar
    draw.rectangle([0, 0, W, 64], fill=(18, 18, 20))
    draw.line([0, 64, W, 64], fill=(40, 40, 45), width=2)
    
    # Logo & title in navbar
    draw.ellipse([24, 16, 56, 48], fill=(212, 160, 86))
    font_nav = get_font(22, bold=True)
    draw.text((72, 32), "AddaDotCom", fill=(255, 255, 255), font=font_nav, anchor="lm")

    # Navbar Badges / Nav Items
    font_small = get_font(14, bold=True)
    draw.rectangle([W-320, 18, W-220, 46], fill=(40, 40, 45), outline=(70, 70, 75))
    draw.text((W-270, 32), "Live Demo", fill=(200, 200, 200), font=font_small, anchor="mm")

    draw.rectangle([W-200, 18, W-100, 46], fill=(212, 160, 86))
    draw.text((W-150, 32), "Admin POS", fill=(20, 20, 20), font=font_small, anchor="mm")

    # Header section in page body
    font_title = get_font(32, bold=True)
    draw.text((40, 110), title, fill=(255, 255, 255), font=font_title)

    font_sub = get_font(18)
    draw.text((40, 150), subtitle, fill=(160, 160, 170), font=font_sub)

    # Render Cards / Panels
    font_card_header = get_font(20, bold=True)
    font_body = get_font(14)
    
    col_width = (W - 120) // len(card_colors)
    for i, (col_name, items) in enumerate(details.items()):
        left = 40 + i * (col_width + 20)
        top = 200
        right = left + col_width
        bottom = H - 40
        
        # Card container
        draw.rectangle([left, top, right, bottom], fill=card_colors[i % len(card_colors)], outline=(50, 50, 60), width=2)
        
        # Header inside card
        draw.rectangle([left, top, right, top + 50], fill=(28, 28, 35))
        draw.text((left + 20, top + 25), col_name, fill=(212, 160, 86), font=font_card_header, anchor="lm")
        draw.line([left, top + 50, right, top + 50], fill=(50, 50, 60), width=1)

        # Content list
        y_cursor = top + 75
        for item in items:
            # Bullet icon
            draw.ellipse([left + 20, y_cursor - 5, left + 30, y_cursor + 5], fill=(212, 160, 86))
            draw.text((left + 40, y_cursor), item, fill=(220, 220, 230), font=font_body, anchor="lm")
            y_cursor += 45
            if y_cursor > bottom - 30:
                break

    img.save(os.path.join(docs_screenshots_dir, filename))
    print(f"Screenshot created: docs/screenshots/{filename}")

# Generate all 9 screenshots
def create_all_screenshots():
    bg = (13, 13, 16)
    
    # 1. Homepage
    create_mockup(
        "homepage.png",
        "AddaDotCom — Enterprise Cafe & POS Management System",
        "Full-stack restaurant ordering, table QR system, KDS kitchen station & real-time analytics",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["Customer App", "Kitchen Display", "POS Billing"],
        {
            "🍽 Customer Menu": ["Scan Table QR to Order", "Category Filters & Search", "Custom Addons & Variants", "Loyalty Points (10pts/₹100)"],
            "👨‍🍳 Kitchen KDS": ["Real-time SSE Ticket Stream", "Color-coded Cooking Timers", "Item Aggregator View", "Single-tap Bump Action"],
            "🏢 Admin & POS": ["Split Bill Payment POS", "Visual Floor Plan Manager", "Revenue & Heatmap Analytics", "GST-compliant Tax Invoices"]
        }
    )

    # 2. Menu Page
    create_mockup(
        "menu.png",
        "Browsable Online Menu & Interactive Cart",
        "Category filtering, veg/non-veg flags, live search, variants, and persistent cart",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["Coffee", "Mains", "Desserts"],
        {
            "☕ Espresso Bar": ["Artisanal Cappuccino - ₹180 [VEG]", "Iced Spanish Latte - ₹220 [VEG]", "Hazelnut Mocha - ₹240 [VEG]", "Cold Brew Float - ₹250 [VEG]"],
            "🍕 Artisanal Kitchen": ["Truffle Mushroom Pizza - ₹490 [VEG]", "Smoked Chicken Panini - ₹380 [NON-VEG]", "Avocado Toast with Egg - ₹320 [NON-VEG]", "Classic Burrata Salad - ₹420 [VEG]"],
            "🛒 Your Cart (3 Items)": ["1x Artisanal Cappuccino (Large) - ₹210", "1x Truffle Mushroom Pizza - ₹490", "Promo: ADDA10 (-10%)", "Total Payable: ₹630"]
        }
    )

    # 3. Order Tracker
    create_mockup(
        "tracker.png",
        "Live Order Tracker — SSE Real-Time Status Stream",
        "Order #ORD-8492 · Table 04 · Dine-In · Real-time status update without page refresh",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["Placed", "Accepted", "Preparing", "Ready"],
        {
            "⏱ Real-Time Stepper": ["1. Order Placed (19:02) ✓", "2. Kitchen Accepted (19:03) ✓", "3. Preparing in Kitchen 🍳 (Current)", "4. Ready for Table Service"],
            "📋 Order Summary": ["Items: 2x Cold Brew, 1x Panini", "Instructions: Extra crispy bread", "Table Number: Table #04 (Indoor)", "Payment Status: Paid via UPI"],
            "🧾 Instant e-Receipt": ["Download GST Invoice PDF", "Verify via QR Code", "Earned 70 Loyalty Points", "Leave Chef Review"]
        }
    )

    # 4. Kitchen KDS
    create_mockup(
        "kds.png",
        "Kitchen Display System (KDS) Station Mode",
        "Fullscreen KDS for line chefs · SSE live stream · Color-coded order urgency timers",
        bg,
        [(28, 22, 22), (28, 26, 20), (20, 28, 22)],
        ["KDS Active", "Sound Alerts ON", "<500ms Latency"],
        {
            "🚨 Urgent Ticket #8490 (16m)": ["Table #02 · Dine-In", "2x Truffle Mushroom Pizza", "1x Iced Mocha (Extra Shot)", "[BUMP ORDER]"],
            "⏳ Active Ticket #8491 (8m)": ["Table #05 · Takeaway", "1x Smoked Chicken Panini", "2x Artisanal Cappuccino", "[BUMP ORDER]"],
            "✅ New Ticket #8492 (2m)": ["Table #04 · Dine-In", "2x Cold Brew Float", "1x Avocado Toast", "[BUMP ORDER]"]
        }
    )

    # 5. POS Billing
    create_mockup(
        "billing.png",
        "Admin POS Billing & Cashier Control",
        "Table-linked order settlement, split payments (Cash/UPI/Card), and GST tax breakdown",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["Table #04", "Active Bill", "Split Payment"],
        {
            "🧾 Table #04 Active Orders": ["2x Cold Brew Float - ₹500", "1x Truffle Mushroom Pizza - ₹490", "1x Chocolate Lava Cake - ₹240", "Subtotal: ₹1,230"],
            "💰 Taxes & Adjustments": ["CGST (2.5%): ₹30.75", "SGST (2.5%): ₹30.75", "Service Charge (5%): ₹61.50", "Grand Total: ₹1,353.00"],
            "💳 Payment Execution": ["Method: Split (UPI + Cash)", "UPI Payment: ₹700.00", "Cash Tendered: ₹653.00", "[GENERATE & PRINT BILL]"]
        }
    )

    # 6. Analytics
    create_mockup(
        "analytics.png",
        "Executive Analytics & Revenue Dashboard",
        "Recharts integration · Today/Weekly/Monthly metrics · Peak hours heatmap & top sellers",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["Today: ₹48,250", "+18.4% WoW", "142 Orders"],
        {
            "📊 Financial KPIs": ["Total Sales Today: ₹48,250", "Average Order Value (AOV): ₹340", "Total Orders Processed: 142", "Active Table Occupancy: 83%"],
            "📈 Top Selling Categories": ["1. Specialty Coffee (38% sales)", "2. Artisanal Pizzas (29% sales)", "3. Breakfast & Toast (18% sales)", "4. Desserts & Shakes (15% sales)"],
            "🔥 Peak Hours Heatmap": ["12:00 PM - 03:00 PM (Lunch Surge)", "05:00 PM - 08:00 PM (Evening Cafe)", "Busiest Table: Table #04 (14 turns)", "Export CSV Report"]
        }
    )

    # 7. Invoice
    create_mockup(
        "invoice.png",
        "GST-Compliant Digital Tax Invoice",
        "Official tax invoice generated with @react-pdf/renderer & QR verification link",
        bg,
        [(28, 28, 32), (28, 28, 32), (28, 28, 32)],
        ["TAX INVOICE", "GSTIN Verified", "QR Authenticated"],
        {
            "🏢 ADDA.COM CAFES PVT LTD": ["GSTIN: 27AAAAA0000A1Z5", "FSSAI Lic No: 11521000000000", "123 MG Road, Connaught Place", "Date: 25-JUL-2026 19:15"],
            "📦 Billed Items": ["2x Artisanal Cappuccino @ ₹180 = ₹360", "1x Truffle Mushroom Pizza @ ₹490 = ₹490", "Taxable Amount: ₹850.00", "CGST 2.5%: ₹21.25 | SGST 2.5%: ₹21.25"],
            "🔑 Payment & Verification": ["Invoice No: INV-2026-08492", "Mode: UPI / GPay (Txn: 894021)", "Total Amount Paid: ₹892.50", "[ SCAN QR TO VERIFY ]"]
        }
    )

    # 8. Tables
    create_mockup(
        "tables.png",
        "Interactive Table Floor Plan & QR Generator",
        "Real-time floor map with status tags (Free, Occupied, Reserved, Bill Requested)",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["12 Tables Total", "8 Occupied", "2 Reserved"],
        {
            "🛋 Indoor Main Zone": ["Table 01 (Cap 2) - FREE", "Table 02 (Cap 4) - OCCUPIED 🔴", "Table 03 (Cap 4) - RESERVED 🟡", "Table 04 (Cap 6) - BILL REQ 🟣"],
            "🌿 Outdoor Patio": ["Table 05 (Cap 2) - OCCUPIED 🔴", "Table 06 (Cap 4) - FREE 🟢", "Table 07 (Cap 4) - OCCUPIED 🔴", "Table 08 (Cap 2) - FREE 🟢"],
            "⚡ Floor Controls": ["Generate QR Code Standees", "Assign Walk-in Customers", "Release Cleaned Tables", "View Table Booking History"]
        }
    )

    # 9. QR Table Ordering
    create_mockup(
        "qr.png",
        "Contactless QR Table Ordering Experience",
        "Scan Table QR → Menu Auto-loads with pre-selected Table ID → Instant Order Placement",
        bg,
        [(22, 22, 28), (22, 22, 28), (22, 22, 28)],
        ["Scan & Pay", "Zero Wait Time", "Table #04 Auto-bound"],
        {
            "📱 Mobile Web Experience": ["Automatic Table #04 Binding", "No App Download Required", "Browse Full Visual Menu", "Custom Special Cooking Notes"],
            "💳 Contactless Payment": ["Integrated UPI / Card / Cash", "Instant SSE Order Confirmation", "Live Preparation Stepper", "Digital Receipt directly on Mobile"],
            "🖨 Branded Table Standee": ["High-resolution Print Layout", "Unique Table QR Code PNG", "Customer Instructions", "Loyalty Rewards QR Promo"]
        }
    )

if __name__ == "__main__":
    create_logo()
    create_all_screenshots()
