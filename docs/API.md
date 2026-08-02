# API.md — AddaDotCom API Reference

All API routes are located under `src/app/api/` and wrapped using `apiHandler()` from `@/lib/api-helpers`.

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional operational message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description message",
  "code": "ERROR_CODE"
}
```

---

## Endpoint Reference

### 1. Menu & Categories

#### `GET /api/menu`
- **Description**: Fetch all active menu items grouped or filtered by category.
- **Query Params**: `category` (optional), `search` (optional).
- **Auth**: Public.

#### `POST /api/menu`
- **Description**: Create a new menu item.
- **Auth**: Protected (ADMIN role required).
- **Body**: Menu item details (Zod validated).

#### `GET /api/categories`
- **Description**: Fetch all menu categories.
- **Auth**: Public.

---

### 2. Orders

#### `GET /api/orders`
- **Description**: Fetch order list for admin/kitchen dashboard.
- **Query Params**: `status`, `type`, `date`.
- **Auth**: Protected (ADMIN/STAFF).

#### `POST /api/orders`
- **Description**: Place a new order (Dine-in, Takeaway, Online).
- **Auth**: Public / Customer.
- **Body**: `{ items, orderType, customerName, phone, tableId, notes }`
- **Side Effects**: Emits SSE `ORDER_CREATED`, fires `AutomationEngine.fire("ORDER_CREATED")`.

#### `PUT /api/orders/[id]`
- **Description**: Update order status (`ACCEPTED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`).
- **Auth**: Protected (ADMIN/STAFF).
- **Side Effects**: Emits SSE `ORDER_UPDATED`, updates table status if completed/cancelled.

---

### 3. Tables & Reservations

#### `GET /api/tables`
- **Description**: Fetch all café tables and their current status (`AVAILABLE`, `OCCUPIED`, `RESERVED`).
- **Auth**: Protected (ADMIN/STAFF).

#### `PUT /api/tables/[id]`
- **Description**: Update table status or assign order.
- **Auth**: Protected (ADMIN/STAFF).
- **Side Effects**: Emits SSE `TABLE_UPDATED`.

#### `POST /api/reservations`
- **Description**: Book a table reservation.
- **Auth**: Public.
- **Body**: `{ guestName, email, phone, guestCount, reservationDate, timeSlot }`

---

### 4. Billing & Invoices

#### `GET /api/bills`
- **Description**: Fetch bills list or filter by order ID.
- **Auth**: Protected (ADMIN/STAFF).

#### `POST /api/bills`
- **Description**: Generate bill for an order with dynamic tax and discounts.
- **Auth**: Protected (ADMIN/STAFF).
- **Side Effects**: Emits SSE `BILL_CREATED`.

#### `GET /api/invoices/public`
- **Description**: Public route for customer digital invoice viewing via QR code.
- **Query Params**: `billNumber`.
- **Auth**: Public.

---

### 5. Analytics & Reports

#### `GET /api/analytics`
- **Description**: Fetch aggregated KPI metrics, daily revenue trends, category breakdown, and peak hours analysis.
- **Auth**: Protected (ADMIN).

---

### 6. Real-Time Stream

#### `GET /api/sse`
- **Description**: Server-Sent Events stream endpoint for live broadcasts.
- **Auth**: Public / Client connection.
- **Response**: `text/event-stream`.

---

### 7. Automations

#### `GET /api/automations`
- **Description**: List all automation workflows and logs.
- **Auth**: Protected (ADMIN).

#### `POST /api/automations`
- **Description**: Create or toggle an automation workflow.
- **Auth**: Protected (ADMIN).
