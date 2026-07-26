const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'docs', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. HERO BANNER SVG
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 440" width="100%">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#090D16" />
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" stroke-width="0.5" stroke-opacity="0.4" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="900" height="440" rx="16" fill="url(#bg-grad)" stroke="#334155" stroke-width="1.5" />
  <rect width="900" height="440" rx="16" fill="url(#grid)" />

  <!-- Ambient Glow -->
  <circle cx="450" cy="180" r="220" fill="#F59E0B" opacity="0.05" filter="blur(40px)" />
  <circle cx="150" cy="100" r="150" fill="#6366F1" opacity="0.04" filter="blur(40px)" />
  <circle cx="750" cy="300" r="180" fill="#10B981" opacity="0.04" filter="blur(40px)" />

  <!-- Top Pill -->
  <g transform="translate(450, 45)">
    <rect x="-210" y="-16" width="420" height="32" rx="16" fill="#1E1B4B" stroke="#6366F1" stroke-width="1" />
    <text x="0" y="5" fill="#A5B4FC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" text-anchor="middle">
      ☕ THE OPEN-SOURCE CAFÉ OPERATING SYSTEM
    </text>
  </g>

  <!-- Main Title -->
  <text x="450" y="130" fill="url(#text-grad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" letter-spacing="-1" text-anchor="middle">
    AddaDotCom
  </text>

  <!-- Subtitle -->
  <text x="450" y="168" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500" text-anchor="middle">
    Zero-touch table ordering · Real-time kitchen display (KDS) · GST-compliant billing
  </text>
  <text x="450" y="194" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-style="italic" text-anchor="middle">
    Built for modern Indian restaurants. Inspired by Toast POS, PetPooja, and Starbucks POS.
  </text>

  <!-- Divider Line -->
  <line x1="100" y1="225" x2="800" y2="225" stroke="#334155" stroke-width="1" stroke-dasharray="4 4" />

  <!-- Stats Grid (5 Cards) -->
  <!-- Card 1 -->
  <g transform="translate(60, 255)">
    <rect width="144" height="135" rx="12" fill="url(#card-grad)" stroke="#334155" stroke-width="1" />
    <text x="72" y="48" fill="#F59E0B" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">12</text>
    <text x="72" y="76" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">Web Pages</text>
    <text x="72" y="98" fill="#64748B" font-family="sans-serif" font-size="11" text-anchor="middle">Customer &amp; Admin</text>
  </g>

  <!-- Card 2 -->
  <g transform="translate(222, 255)">
    <rect width="144" height="135" rx="12" fill="url(#card-grad)" stroke="#334155" stroke-width="1" />
    <text x="72" y="48" fill="#10B981" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">15</text>
    <text x="72" y="76" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">API Groups</text>
    <text x="72" y="98" fill="#64748B" font-family="sans-serif" font-size="11" text-anchor="middle">REST &amp; SSE Pub/Sub</text>
  </g>

  <!-- Card 3 -->
  <g transform="translate(384, 255)">
    <rect width="144" height="135" rx="12" fill="url(#card-grad)" stroke="#334155" stroke-width="1" />
    <text x="72" y="48" fill="#6366F1" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">8</text>
    <text x="72" y="76" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">SSE Events</text>
    <text x="72" y="98" fill="#64748B" font-family="sans-serif" font-size="11" text-anchor="middle">Real-time Stream</text>
  </g>

  <!-- Card 4 -->
  <g transform="translate(546, 255)">
    <rect width="144" height="135" rx="12" fill="url(#card-grad)" stroke="#334155" stroke-width="1" />
    <text x="72" y="48" fill="#EC4899" font-family="sans-serif" font-size="30" font-weight="800" text-anchor="middle">&lt;500ms</text>
    <text x="72" y="76" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">KDS Latency</text>
    <text x="72" y="98" fill="#64748B" font-family="sans-serif" font-size="11" text-anchor="middle">Sub-second tickets</text>
  </g>

  <!-- Card 5 -->
  <g transform="translate(708, 255)">
    <rect width="144" height="135" rx="12" fill="url(#card-grad)" stroke="#334155" stroke-width="1" />
    <text x="72" y="48" fill="#3B82F6" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">0</text>
    <text x="72" y="76" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">Polling Loops</text>
    <text x="72" y="98" fill="#64748B" font-family="sans-serif" font-size="11" text-anchor="middle">Pure Pub/Sub Stream</text>
  </g>
</svg>`;

// 2. WHY ADDADOTCOM BANNER SVG
const whySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%">
  <defs>
    <linearGradient id="bg-grad-why" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <pattern id="grid-why" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" stroke-width="0.5" stroke-opacity="0.3" />
    </pattern>
  </defs>

  <rect width="900" height="520" rx="16" fill="url(#bg-grad-why)" stroke="#334155" stroke-width="1.5" />
  <rect width="900" height="520" rx="16" fill="url(#grid-why)" />

  <!-- Section Header -->
  <text x="40" y="45" fill="#EC4899" font-family="sans-serif" font-size="12" font-weight="800" letter-spacing="2">WHY ADDADOTCOM?</text>
  <text x="40" y="75" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="800">Stop juggling paper KOTs, WhatsApp screenshots, and disconnected billing software.</text>

  <!-- Left Column: The Daily Pain -->
  <g transform="translate(40, 100)">
    <rect width="400" height="380" rx="12" fill="#181013" stroke="#831843" stroke-width="1.5" />
    <rect width="400" height="42" rx="12" fill="#831843" opacity="0.3" />
    <text x="20" y="27" fill="#F43F5E" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="1">❌ THE DAILY PAIN IN LEGACY POS</text>

    <!-- Bullets -->
    <g transform="translate(20, 65)" font-family="sans-serif" font-size="13" fill="#FDA4AF">
      <text x="0" y="0" font-weight="700">📋 Paper KOTs get lost, misread, or delayed</text>
      <text x="0" y="18" font-size="11" fill="#991B1B">Tickets smudge in kitchen steam &amp; cause wrong orders</text>

      <text x="0" y="55" font-weight="700">🔄 Staff shouting across the counter</text>
      <text x="0" y="73" font-size="11" fill="#991B1B">High noise, chaos during peak dining hours</text>

      <text x="0" y="110" font-weight="700">🧾 Manual GST calculations &amp; invoice errors</text>
      <text x="0" y="128" font-size="11" fill="#991B1B">CGST/SGST split mistakes &amp; tax compliance risk</text>

      <text x="0" y="165" font-weight="700">📱 Constant "Where is my order?" questions</text>
      <text x="0" y="183" font-size="11" fill="#991B1B">Customers waiting blindly without status updates</text>

      <text x="0" y="220" font-weight="700">📦 "We ran out of milk again"</text>
      <text x="0" y="238" font-size="11" fill="#991B1B">No inventory threshold warnings before stockouts</text>

      <text x="0" y="275" font-weight="700">💰 ₹3,000–15,000/mo recurring SaaS lock-in</text>
      <text x="0" y="293" font-size="11" fill="#991B1B">Expensive subscriptions for basic features</text>
    </g>
  </g>

  <!-- Right Column: How AddaDotCom Fixes It -->
  <g transform="translate(460, 100)">
    <rect width="400" height="380" rx="12" fill="#061C16" stroke="#047857" stroke-width="1.5" />
    <rect width="400" height="42" rx="12" fill="#047857" opacity="0.3" />
    <text x="20" y="27" fill="#34D399" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="1">✅ HOW ADDADOTCOM FIXES IT</text>

    <!-- Bullets -->
    <g transform="translate(20, 65)" font-family="sans-serif" font-size="13" fill="#6EE7B7">
      <text x="0" y="0" font-weight="700">🖥 Real-Time KDS Station (&lt;500ms)</text>
      <text x="0" y="18" font-size="11" fill="#059669">Color-coded timers, audio chime, zero paper lost</text>

      <text x="0" y="55" font-weight="700">📱 Contactless Table QR Ordering</text>
      <text x="0" y="73" font-size="11" fill="#059669">Scan → Menu auto-loads → Order direct to cook line</text>

      <text x="0" y="110" font-weight="700">🧾 Auto-Computed GST PDF Invoices</text>
      <text x="0" y="128" font-size="11" fill="#059669">QR-verified e-receipts, downloadable tax breakdown</text>

      <text x="0" y="165" font-weight="700">📍 Live Customer Order Tracker</text>
      <text x="0" y="183" font-size="11" fill="#059669">Real-time status stepper: Placed → Prep → Ready</text>

      <text x="0" y="220" font-weight="700">📦 Low-Stock Inventory Alerts</text>
      <text x="0" y="238" font-size="11" fill="#059669">Automatic ingredient threshold warnings &amp; logs</text>

      <text x="0" y="275" font-weight="700">🌐 100% Free &amp; Open Source (MIT)</text>
      <text x="0" y="293" font-size="11" fill="#059669">Self-host on Vercel + Neon with zero monthly fees</text>
    </g>
  </g>
</svg>`;

// 3. ARCHITECTURE WORKFLOW SVG
const archSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="100%">
  <defs>
    <linearGradient id="bg-grad-arch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <pattern id="grid-arch" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" stroke-width="0.5" stroke-opacity="0.4" />
    </pattern>
    <linearGradient id="node-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#312E81" />
      <stop offset="100%" stop-color="#4338CA" />
    </linearGradient>
  </defs>

  <rect width="900" height="560" rx="16" fill="url(#bg-grad-arch)" stroke="#334155" stroke-width="1.5" />
  <rect width="900" height="560" rx="16" fill="url(#grid-arch)" />

  <!-- Section Header -->
  <text x="450" y="42" fill="#818CF8" font-family="sans-serif" font-size="12" font-weight="800" letter-spacing="2" text-anchor="middle">SYSTEM ARCHITECTURE &amp; DATA FLOW</text>
  <text x="450" y="70" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">Sub-second Pub/Sub Event Broadcast System</text>

  <!-- Node 1: Customer Frontend (Top Left) -->
  <g transform="translate(60, 110)">
    <rect width="230" height="85" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" />
    <text x="115" y="32" fill="#38BDF8" font-family="sans-serif" font-size="13" font-weight="800" text-anchor="middle">📱 Customer Browser</text>
    <text x="115" y="52" fill="#94A3B8" font-family="sans-serif" font-size="11" text-anchor="middle">QR Scan · Menu · Cart · Tracker</text>
    <text x="115" y="68" fill="#64748B" font-family="sans-serif" font-size="10" text-anchor="middle">POST /api/orders</text>
  </g>

  <!-- Node 2: Admin POS (Top Right) -->
  <g transform="translate(610, 110)">
    <rect width="230" height="85" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5" />
    <text x="115" y="32" fill="#F59E0B" font-family="sans-serif" font-size="13" font-weight="800" text-anchor="middle">💳 POS Billing &amp; Admin</text>
    <text x="115" y="52" fill="#94A3B8" font-family="sans-serif" font-size="11" text-anchor="middle">Table Settlement · Split Pay</text>
    <text x="115" y="68" fill="#64748B" font-family="sans-serif" font-size="10" text-anchor="middle">POST /api/billing</text>
  </g>

  <!-- Central Hub: SSE Pub/Sub Event Bus -->
  <g transform="translate(230, 240)">
    <rect width="440" height="110" rx="14" fill="url(#node-indigo)" stroke="#6366F1" stroke-width="2" />
    <circle cx="440" cy="55" r="160" fill="#6366F1" opacity="0.08" filter="blur(20px)" />
    <text x="220" y="38" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="900" text-anchor="middle">⚡ AddaDotCom SSE Event Bus (/api/sse)</text>
    <text x="220" y="62" fill="#C7D2FE" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle">Pub/Sub Broadcast Engine · Latency &lt;500ms · 0 Polling</text>
    <text x="220" y="85" fill="#A5B4FC" font-family="sans-serif" font-size="11" text-anchor="middle">Events: new-order · order-updated · bill-paid · table-updated</text>
  </g>

  <!-- Arrows from Top to Central -->
  <path d="M 175 195 L 175 295 L 230 295" fill="none" stroke="#38BDF8" stroke-width="2" stroke-dasharray="4 4" />
  <path d="M 725 195 L 725 295 L 670 295" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="4 4" />

  <!-- Outbound Nodes (Bottom Row) -->
  <!-- Bottom Node 1: KDS Station -->
  <g transform="translate(60, 410)">
    <rect width="230" height="90" rx="10" fill="#0F172A" stroke="#10B981" stroke-width="1.5" />
    <text x="115" y="32" fill="#34D399" font-family="sans-serif" font-size="13" font-weight="800" text-anchor="middle">👨‍🍳 Kitchen KDS Station</text>
    <text x="115" y="52" fill="#94A3B8" font-family="sans-serif" font-size="11" text-anchor="middle">Live Tickets · Color Timers</text>
    <text x="115" y="70" fill="#059669" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Audio Chime Triggered</text>
  </g>

  <!-- Bottom Node 2: Live Tracker -->
  <g transform="translate(335, 410)">
    <rect width="230" height="90" rx="10" fill="#0F172A" stroke="#EC4899" stroke-width="1.5" />
    <text x="115" y="32" fill="#F472B6" font-family="sans-serif" font-size="13" font-weight="800" text-anchor="middle">📍 Live Order Tracker</text>
    <text x="115" y="52" fill="#94A3B8" font-family="sans-serif" font-size="11" text-anchor="middle">Real-time Stepper on Phone</text>
    <text x="115" y="70" fill="#DB2777" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Placed → Prep → Ready</text>
  </g>

  <!-- Bottom Node 3: PostgreSQL DB -->
  <g transform="translate(610, 410)">
    <rect width="230" height="90" rx="10" fill="#0F172A" stroke="#3B82F6" stroke-width="1.5" />
    <text x="115" y="32" fill="#60A5FA" font-family="sans-serif" font-size="13" font-weight="800" text-anchor="middle">🗄 PostgreSQL + Prisma</text>
    <text x="115" y="52" fill="#94A3B8" font-family="sans-serif" font-size="11" text-anchor="middle">Orders · Bills · Inventory</text>
    <text x="115" y="70" fill="#2563EB" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">12 Models · Relational ORM</text>
  </g>

  <!-- Arrows from Central to Outbound -->
  <path d="M 310 350 L 310 380 L 175 380 L 175 410" fill="none" stroke="#10B981" stroke-width="2" stroke-dasharray="4 4" />
  <path d="M 450 350 L 450 410" fill="none" stroke="#EC4899" stroke-width="2" stroke-dasharray="4 4" />
  <path d="M 590 350 L 590 380 L 725 380 L 725 410" fill="none" stroke="#3B82F6" stroke-width="2" stroke-dasharray="4 4" />
</svg>`;

// 4. QUICK START WORKFLOW SVG
const setupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="100%">
  <defs>
    <linearGradient id="bg-grad-setup" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
  </defs>

  <rect width="900" height="240" rx="16" fill="url(#bg-grad-setup)" stroke="#334155" stroke-width="1.5" />

  <!-- Header -->
  <text x="40" y="40" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="800" letter-spacing="2">WORKS THE SECOND YOU INSTALL IT — ZERO CONFIG</text>
  <text x="40" y="65" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="800">Fresh Install → Live Café System in 3 Commands</text>

  <!-- Step 1 -->
  <g transform="translate(40, 90)">
    <rect width="250" height="110" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="30" cy="30" r="14" fill="#6366F1" />
    <text x="30" y="35" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="800" text-anchor="middle">1</text>
    <text x="55" y="34" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="700">Clone &amp; Install</text>
    <rect x="15" y="55" width="220" height="40" rx="6" fill="#090D16" />
    <text x="25" y="79" fill="#A5B4FC" font-family="monospace" font-size="11">git clone &amp;&amp; npm install</text>
  </g>

  <!-- Arrow 1 -->
  <path d="M 302 145 L 328 145" fill="none" stroke="#6366F1" stroke-width="2" stroke-dasharray="3 3" />

  <!-- Step 2 -->
  <g transform="translate(335, 90)">
    <rect width="250" height="110" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="30" cy="30" r="14" fill="#F59E0B" />
    <text x="30" y="35" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="800" text-anchor="middle">2</text>
    <text x="55" y="34" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="700">Sync &amp; Seed DB</text>
    <rect x="15" y="55" width="220" height="40" rx="6" fill="#090D16" />
    <text x="25" y="79" fill="#FCD34D" font-family="monospace" font-size="10">npx prisma db push &amp;&amp; seed</text>
  </g>

  <!-- Arrow 2 -->
  <path d="M 597 145 L 623 145" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="3 3" />

  <!-- Step 3 -->
  <g transform="translate(630, 90)">
    <rect width="230" height="110" rx="10" fill="#06201B" stroke="#059669" stroke-width="1.5" />
    <circle cx="30" cy="30" r="14" fill="#10B981" />
    <text x="30" y="35" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="800" text-anchor="middle">3</text>
    <text x="55" y="34" fill="#34D399" font-family="sans-serif" font-size="14" font-weight="700">Launch Server</text>
    <rect x="15" y="55" width="200" height="40" rx="6" fill="#090D16" />
    <text x="25" y="79" fill="#6EE7B7" font-family="monospace" font-size="11">npm run dev (Port 3000)</text>
  </g>
</svg>`;

// 5. REAL-TIME ENGINE SVG
const realtimeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" width="100%">
  <defs>
    <linearGradient id="bg-grad-rt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
  </defs>

  <rect width="900" height="420" rx="16" fill="url(#bg-grad-rt)" stroke="#334155" stroke-width="1.5" />

  <!-- Header -->
  <text x="40" y="45" fill="#60A5FA" font-family="sans-serif" font-size="12" font-weight="800" letter-spacing="2">REAL-TIME SSE ARCHITECTURE</text>
  <text x="40" y="75" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="800">3-Layer Pub/Sub Dispatch Engine</text>

  <!-- Layer 1 -->
  <g transform="translate(40, 105)">
    <rect width="820" height="85" rx="10" fill="#1E293B" stroke="#10B981" stroke-width="1.5" />
    <text x="25" y="30" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="800">LAYER 1 · SCOPE: KITCHEN LINE</text>
    <text x="25" y="54" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="700">Sub-second KDS Broadcast (&lt;500ms)</text>
    <text x="25" y="72" fill="#94A3B8" font-family="sans-serif" font-size="11">Triggers new ticket rendering, audio chime alert, and color timer initialization automatically</text>
  </g>

  <!-- Layer 2 -->
  <g transform="translate(40, 205)">
    <rect width="820" height="85" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5" />
    <text x="25" y="30" fill="#FBBF24" font-family="sans-serif" font-size="12" font-weight="800">LAYER 2 · SCOPE: CASHIER &amp; FLOOR</text>
    <text x="25" y="54" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="700">Interactive Table State Sync</text>
    <text x="25" y="72" fill="#94A3B8" font-family="sans-serif" font-size="11">Synchronizes table grid status (Available, Occupied, Reserved, Bill Requested) across all admin terminals</text>
  </g>

  <!-- Layer 3 -->
  <g transform="translate(40, 305)">
    <rect width="820" height="85" rx="10" fill="#1E293B" stroke="#EC4899" stroke-width="1.5" />
    <text x="25" y="30" fill="#F472B6" font-family="sans-serif" font-size="12" font-weight="800">LAYER 3 · SCOPE: CUSTOMER DEVICE</text>
    <text x="25" y="54" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="700">Live Order Tracker Stepper</text>
    <text x="25" y="72" fill="#94A3B8" font-family="sans-serif" font-size="11">Pushes instant status transitions (Placed → Preparing → Ready → Served) directly to customer browser with 0 polling HTTP calls</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'hero-banner.svg'), heroSvg);
fs.writeFileSync(path.join(assetsDir, 'why-addadotcom.svg'), whySvg);
fs.writeFileSync(path.join(assetsDir, 'architecture-workflow.svg'), archSvg);
fs.writeFileSync(path.join(assetsDir, 'quick-start-workflow.svg'), setupSvg);
fs.writeFileSync(path.join(assetsDir, 'realtime-engine.svg'), realtimeSvg);

console.log('Successfully generated 5 README SVG visual assets in docs/assets/');
