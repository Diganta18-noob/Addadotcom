# API Inventory Map — AddaDotCom

This document describes the request/response payloads, query parameters, database operations, and system side-effects for each backend API endpoint.

---

## 🔐 Auth Endpoints
### `/api/auth/[...nextauth]`
Handles authentication operations using NextAuth engine.
- **Methods:** `GET`, `POST`
- **Authentication Providers:**
  - Credentials (`email`/`password` matched with `users.passwordHash` using `bcrypt.compare`).
  - Google OAuth (optional, enabled via `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`).
- **Callbacks:**
  - `jwt`: Adds `user.role` and `user.id` to JWT token.
  - `session`: Attaches `token.role` and `token.id` to `session.user`.

---

## 🍽️ Menu Endpoints
### `/api/menu`
- **Method:** `GET`
  - **Query Params:**
    - `category` (string, filters items by category slug)
    - `search` (string, matches name/description case-insensitively)
    - `tags` (string, comma-separated list of tags)
    - `available` (boolean string `true`)
    - `special` (boolean string `true`)
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "categories": [ { "id": "...", "name": "...", "items": [] } ],
        "items": [ { "id": "...", "name": "...", "price": 0 } ]
      }
    }
    ```
  - **Critical Warning / Known Bug:** `{ hasSome: tagList }` query filter on `tags` will cause a runtime crash if queries specify `?tags=VEG`, because `tags` is stored in SQLite as a scalar string, not a string array.
- **Method:** `POST`
  - **Payload:**
    ```json
    {
      "categoryId": "string",
      "name": "string",
      "slug": "string? (optional)",
      "description": "string?",
      "price": 0.0,
      "image": "string?",
      "tags": ["string"],
      "isAvailable": true,
      "prepTime": 0,
      "sortOrder": 0,
      "isSpecial": false,
      "isBestseller": false,
      "variants": [],
      "addons": []
    }
    ```
  - **Response (201 Created):** Created MenuItem object including Category profile.

### `/api/menu/[id]`
- **Method:** `GET`
  - **Response (200 OK):** Returns MenuItem JSON. Returns `404` if not found.
- **Method:** `PUT`
  - **Payload:** Partial MenuItem object.
  - **Response (200 OK):** Updated MenuItem JSON.
- **Method:** `DELETE`
  - **Response (200 OK):** `{ "success": true, "message": "Item deleted" }`.

---

## 🛒 Order Endpoints
### `/api/orders`
- **Method:** `GET`
  - **Query Params:**
    - `status` (string, filters by OrderStatus)
    - `type` (string, filters by OrderType)
    - `today` (boolean string `true`, filters items created between `00:00:00.000` and `23:59:59.999` of current day)
  - **Response (200 OK):** Array of Order objects including `bill` and `table` relations.
- **Method:** `POST`
  - **Payload:**
    ```json
    {
      "userId": "string?",
      "type": "DINE_IN | TAKEAWAY | DELIVERY",
      "tableId": "string?",
      "reservationId": "string?",
      "items": [ { "menuItemId": "...", "menuItemName": "...", "qty": 1, "unitPrice": 100, "totalPrice": 100 } ],
      "notes": "string?",
      "deliveryAddress": "string?",
      "deliveryFee": 0.0,
      "pickupTime": "string? (ISO Date)"
    }
    ```
  - **Side-Effects:**
    - Generates unique order number: `ORD-YYYYMMDD-XXXX`.
    - If `type` is `DINE_IN` and `tableId` is provided, updates the table status to `OCCUPIED`.
  - **Response (201 Created):** Created Order object.

### `/api/orders/[id]`
- **Method:** `GET`
  - **Params:** `id` can be Prisma ID or unique order number (e.g. `ORD-20260717-A1B2`).
  - **Response (200 OK):** Single Order details including `bill` and `table`. Returns `404` if not found.
- **Method:** `PUT`
  - **Payload:** `{ "status": "OrderStatus?", "notes": "string?", "items": "Json?" }`
  - **Side-Effects:**
    - If status updated to `COMPLETED`, order is dine-in, and table is attached, table status is updated to `NEEDS_CLEANING`.
  - **Response (200 OK):** Updated Order object.

---

## 📅 Reservation Endpoints
### `/api/reservations`
- **Method:** `GET`
  - **Query Params:** `date` (ISO Date string), `status` (ReservationStatus), `code` (booking code).
  - **Response (200 OK):** Array of reservations.
- **Method:** `POST`
  - **Payload:**
    ```json
    {
      "userId": "string?",
      "guestName": "string",
      "guestEmail": "string?",
      "guestPhone": "string",
      "date": "string (ISO Date)",
      "timeSlot": "string (e.g. 19:00)",
      "duration": 90,
      "partySize": 2,
      "notes": "string?"
    }
    ```
  - **Allocation Logic:**
    1. Fetches all tables where `capacity >= partySize` (best fit sorted ascending).
    2. Queries existing reservations on that `date` at that `timeSlot` that are `PENDING`, `CONFIRMED`, or `SEATED`.
    3. Finds the first table not in the list of currently booked table IDs.
    4. If no table is available, returns `409 Conflict` (`No tables available for this time slot`).
    5. Generates unique booking code: `BK-XXXXXX`.
    6. Creates reservation in state `CONFIRMED` linked to the allocated table.
  - **Response (201 Created):** Created reservation object with table relations.

### `/api/reservations/[id]`
- **Method:** `GET`
  - **Params:** `id` can be database reservation ID or booking code `BK-XXXXXX`.
  - **Response (200 OK):** Single Reservation details including table.
- **Method:** `PUT`
  - **Payload:** `{ "status": "SEATED | CANCELLED | COMPLETED | ...", "tableId": "...", "notes": "...", "date": "...", "timeSlot": "...", "partySize": 2 }`
  - **Side-Effects:**
    - If status changed to `SEATED`, updates associated table status to `OCCUPIED`.
  - **Response (200 OK):** Updated reservation details.

---

## 💳 POS & Billing Endpoints
### `/api/billing`
- **Method:** `GET`
  - **Query Params:** `status` (BillStatus), `today` (boolean string `true`), `search` (invoice text search).
  - **Response (200 OK):** Array of bills.
- **Method:** `POST`
  - **Payload:**
    ```json
    {
      "orderId": "string",
      "subtotal": 0.0,
      "discounts": [],
      "serviceCharge": 0.0,
      "serviceChargeRate": 0.0,
      "taxes": [],
      "total": 0.0,
      "roundingAdj": 0.0,
      "cashierId": "string?",
      "splitConfig": {},
      "payments": []
    }
    ```
  - **Side-Effects:**
    - Generates invoice number: `BILL-YYYYMMDD-XXXX`.
    - If `payments` are recorded, invoice status is set to `PAID`, otherwise `UNPAID`.
    - If status is `PAID` and order has a `tableId`, table status is reset to `FREE` and order status updated to `COMPLETED`.
  - **Response (201 Created):** Bill JSON.

### `/api/billing/[id]`
- **Method:** `GET`
  - **Params:** `id` can be database ID or bill number `BILL-YYYYMMDD-XXXX`.
  - **Response (200 OK):** Single bill including order details.
- **Method:** `PUT`
  - **Payload:** Partial Bill fields to update.
  - **Side-Effects:**
    - If status updated to `PAID`, updates table status to `FREE` and order status to `COMPLETED`.
  - **Response (200 OK):** Updated bill JSON.

---

## 📦 Inventory Endpoints
### `/api/inventory`
- **Method:** `GET`
  - **Response (200 OK):** Array of InventoryItem objects.
- **Method:** `POST`
  - **Payload:** `{ "name": "...", "unit": "...", "quantity": 0.0, "lowStockThreshold": 0.0 }`
  - **Side-Effects:** Writes log entry to `StockLog` for initial stock registration.
  - **Response (201 Created):** Created InventoryItem JSON.

### `/api/inventory/[id]`
- **Method:** `PUT`
  - **Payload:** `{ "change": 0.0 (positive or negative float), "reason": "string?" }`
  - **Side-Effects:**
    - Updates item quantity: `quantity = quantity + change`.
    - Creates record in `StockLog` logging the delta, reason, and timestamp.
  - **Response (200 OK):** Updated InventoryItem JSON.

---

## 📈 Dashboard & Reports Endpoints
### `/api/dashboard`
- **Method:** `GET`
  - **Response (200 OK):**
    Aggregates:
    - Today's Revenue: Sum of `PAID` bills created today.
    - Today's Orders count.
    - Today's Reservations count.
    - Average Order Value: `Revenue / Orders`.
    - Top Selling Items (scans items array in today's orders).
    - Daily Revenue: 7-day sales totals trend list.
    - Sales by Category: List of categories with placeholder values.
    - Recent 10 Orders.
    - Upcoming Reservations with status `PENDING` or `CONFIRMED`.

### `/api/reports`
- **Method:** `GET`
  - **Query Params:** `range` (today, week, month, custom), `start` (date string), `end` (date string).
  - **Response (200 OK):** Aggregated sales figures, total orders count, average order value, accumulated service charges and GST, and daily trends list.

---

## ⚙️ Settings & Promo Endpoints
### `/api/settings`
- **Method:** `GET`
  - **Response (200 OK):** Array of all Settings.
- **Method:** `PUT`
  - **Payload:** Can be array of `{ key, value }` or single object `{ [key]: value }`.
  - **Side-Effects:** Upserts key-value pairs into the settings table.
  - **Response (200 OK):** Updated Settings array.

### `/api/promo`
- **Method:** `POST`
  - **Payload:** `{ "code": "string", "amount": 0.0 }`
  - **Validation Steps:**
    - Checks active state.
    - Checks expiration date limit.
    - Checks total usage count is under usage limit.
    - Validates basket subtotal `amount >= promo.minOrder`.
  - **Response (200 OK):** Code verification details, discount type, value, and cap amount.

---

## 📡 Live Stream SSE
### `/api/sse`
- **Method:** `GET`
  - **Headers:** `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`.
  - **Behavior:** Opens persistent response stream. Immediately broadcasts a `welcome` event. Fires a `heartbeat` `ping` every 15 seconds to prevent browser termination.
