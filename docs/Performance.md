# Performance.md — Performance Optimization Guide

## Core Performance Metrics & Optimization

### 1. Rendering & Component Optimization
- **Next.js App Router**: SSR for initial page load; dynamic client components isolated to interactive subtree (`"use client"`).
- **Image Optimization**: `next/image` handles WebP conversion, dynamic sizing, and lazy loading.
- **Font Optimization**: Google Fonts (`DM Serif Display`, `DM Sans`) pre-loaded via `next/font/google`.

### 2. Real-Time Stream Performance
- **Server-Sent Events (SSE)**: Single persistent HTTP connection replaces high-frequency polling.
- Client `EventSource` handles connection reconnects automatically without browser locks.

### 3. Smooth Animation Performance
- **Lenis Smooth Scroll**: Configured with light easing bounds (`duration: 0.9`).
- **GSAP / Framer Motion**: All transform-based animations target hardware-accelerated CSS properties (`transform: translate3d`, `opacity`).

### 4. Database Query Optimization
- Prisma query selection specifies explicit fields where possible.
- Indexes applied to frequently queried fields (`orderNumber`, `billNumber`, `tableId`, `status`, `createdAt`).
