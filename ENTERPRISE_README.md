# AddaDotCom Café System — Enterprise Architecture & Refactoring Guide

## 🚀 Overview

AddaDotCom is a production-grade, full-stack café and restaurant management web application built with **Next.js 14 App Router, TypeScript, Prisma ORM, Zustand, and TailwindCSS**. 

This document details the architectural decisions, security models, database performance optimizations, and DevOps setup implemented to transform the repository into a high-availability, enterprise-ready system.

---

## 🏗️ 1. Architecture & Design Patterns

The backend business layer is structured following **Clean Architecture** and **SOLID principles**:

```
src/
├── constants/             # Enums, HTTP codes, System Roles
├── errors/                # AppError hierarchy (BadRequest, Unauthorized, Forbidden, NotFound)
├── utils/                 # apiResponse formatters, Winston logger, Cache manager
├── validators/            # Zod validation schemas (Auth, Menu, Order, Reservation)
├── services/              # Pure Domain Business Logic (Auth, Menu, Order, Reservation)
├── middlewares/           # JWT Guards, RBAC authorization, Route Middleware
├── docs/                  # OpenAPI / Swagger Specifications
└── app/api/               # Thin Controllers mapping requests to Services
```

### Key SOLID Principles Applied:
- **Single Responsibility Principle (SRP):** API routes act strictly as thin HTTP controllers, delegating all domain rules to dedicated `Services`.
- **Open/Closed Principle (OCP):** Caching and logging interfaces allow swapping backends (e.g., in-memory map to Redis cluster or Winston file storage) without touching controller code.
- **Dependency Inversion Principle (DIP):** Database access is decoupled through Prisma ORM repositories and domain models.

---

## 🔒 2. Authentication & Security Architecture

### Token Rotation Strategy:
1. **Short-Lived Access Tokens (15 Minutes):** Encodes user identity (`userId`, `email`, `role`). Transmitted via `Authorization: Bearer <token>` header or `accessToken` cookie.
2. **Long-Lived Refresh Tokens (7 Days):** Issued upon authentication and stored exclusively in **`HttpOnly`**, **`Secure`**, **`SameSite=Strict`** cookies to prevent XSS theft.
3. **Password Security:** Hashes user credentials using `bcrypt` with salt rounds set to 10.
4. **RBAC Permission Matrix:**

| Role | Browse & Search Menu | Place Orders | Update Order Status | Manage Menu & Inventory | Manage Users & Analytics |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **CUSTOMER** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **STAFF** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **MANAGER** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📦 3. Standardized API Response & Error Format

Every API endpoint returns a predictable JSON envelope:

### Success Response (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 23,
    "totalPages": 2
  },
  "timestamp": "2026-07-22T02:00:00.000Z"
}
```

### Error Response (`400 Bad Request` / `401 Unauthorized` / `403 Forbidden`):
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "meta": null,
  "errors": [
    { "code": "invalid_type", "path": ["price"], "message": "Expected number, received string" }
  ],
  "timestamp": "2026-07-22T02:00:00.000Z"
}
```

---

## ⚡ 4. Database Optimization & Caching Strategy

- **Fixing SQLite/Prisma Array Query Crashes:** Replaced unsafe array query methods (`hasSome`) with string containment matching (`contains`), eliminating backend application crashes during tag searches (`?tags=VEG`).
- **Pagination & Search Filtering:** Implemented index-backed search on `/api/menu` (`search`, `category`, `priceMin`, `priceMax`, `sort`, `page`, `limit`).
- **Cache Management Layer:** `CacheService` caches public menu responses with a 5-minute TTL. Mutative operations (POST/PUT/DELETE) automatically invalidate cache keys matching `menu_list_*`.

---

## 🐳 5. DevOps & Containerization

### Local Development:
```bash
npm run dev
```

### Docker Production Deployment:
```bash
docker-compose up --build -d
```
Spins up:
- **`web`**: Next.js multi-stage container.
- **`postgres`**: Production PostgreSQL 16 container with persistent volumes and health checks.
- **`redis`**: Redis 7 caching container.

---

## 💡 6. System Design Interview Q&A

### Q1: How do you prevent XSS attacks when storing JWT tokens?
**Answer:** Access tokens are kept short-lived (15 minutes). Refresh tokens are stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies. `HttpOnly` flags prevent JavaScript code (e.g. `document.cookie`) from accessing the refresh token, nullifying XSS token theft vectors.

### Q2: How does your caching strategy handle stale data?
**Answer:** We use an **Active Cache Invalidation** strategy. Whenever an admin creates, updates, or deletes a menu item via `MenuService`, the service triggers `cache.invalidatePattern('menu_list_')`, purging stale cached listings across all pagination filters immediately.

### Q3: Why separate Controllers from Services in Next.js App Router?
**Answer:** Next.js route handlers (`route.ts`) are HTTP transport adapters. Moving domain rules into `Services` ensures that logic is reusable across REST controllers, Server Actions, Background Jobs, and CLI tools, adhering to the Single Responsibility Principle and simplifying unit testing.
