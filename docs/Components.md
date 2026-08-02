# Components.md — Component Registry & Standards

## Component Architecture Overview

Component tree located in `src/components/`.

```
src/components/
├── animations/   # GSAP & Framer Motion wrappers
├── cart/         # Shopping cart drawer & controls
├── invoice/      # 8 GST Invoice sub-components
├── layout/       # Navigation, footer, admin chrome
└── shared/       # Reusable UI controls
```

---

## Key Component Modules

### 1. Invoice Sub-Components (`src/components/invoice/`)
- `InvoiceDocument.tsx`: Parent invoice container with state management & dynamic URL origin.
- `InvoiceHeader.tsx`: Cafe metadata, logo, FSSAI, GSTIN header display.
- `InvoiceMeta.tsx`: Bill number, date, payment status, table number.
- `InvoiceTable.tsx`: Line-item breakdown table with quantities and split amounts.
- `InvoiceTaxBreakdown.tsx`: CGST/SGST detailed calculation block.
- `InvoiceFooter.tsx`: Terms, thank you note, public QR code verification element.
- `InvoicePDF.tsx`: `@react-pdf/renderer` PDF document builder.
- `InvoiceActions.tsx`: Download PDF, Print, Share controls.

### 2. Layout Components (`src/components/layout/`)
- `Navbar.tsx`: Public navigation bar with cart indicator and user session controls.
- `Footer.tsx`: Public footer with café location, working hours, and social links.
- `AdminSidebar.tsx`: Navigation sidebar for all 15 admin pages.
- `AdminNotifier.tsx`: Global notification toast listener for SSE alerts.

### 3. Shared Components (`src/components/shared/`)
- `StatusBadge.tsx`: Color-coded badge for orders, tables, and bill statuses.
- `LoadingButton.tsx`: Button with inline spinner state for async operations.
