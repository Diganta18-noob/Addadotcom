# Database.md — AddaDotCom Database & Schema Reference

Defined in `prisma/schema.prisma`.

## Enums

- **Role**: `CUSTOMER`, `STAFF`, `ADMIN`
- **OrderType**: `DINE_IN`, `TAKEAWAY`, `DELIVERY`
- **OrderStatus**: `PLACED`, `ACCEPTED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`
- **TableStatus**: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`
- **PaymentMethod**: `CASH`, `UPI`, `CARD`, `ONLINE`
- **PaymentStatus**: `PENDING`, `PAID`, `FAILED`, `REFUNDED`

---

## Key Models Summary

### 1. User
- Stores authentication credentials, OAuth details, role, and loyalty points.
- **Relations**: Has many `Order`s, `Reservation`s, `Review`s.

### 2. MenuItem & Category
- **Category**: `name`, `slug`, `image`, `sortOrder`.
- **MenuItem**: `name`, `description`, `price`, `image`, `isVeg`, `isAvailable`, `recipe` (JSON), `addons` (JSON).

### 3. Order & OrderItem
- **Order**: `orderNumber`, `type`, `status`, `totalAmount`, `customerName`, `phone`, `tableId`.
- **OrderItem**: `orderId`, `menuItemId`, `quantity`, `price`, `notes`.

### 4. Table & Reservation
- **Table**: `tableNumber`, `capacity`, `section`, `status`, `qrCodeUrl`.
- **Reservation**: `reservationCode`, `guestName`, `phone`, `guestCount`, `reservationDate`, `timeSlot`, `status`.

### 5. Bill
- **Bill**: `billNumber`, `orderId`, `subtotal`, `taxAmount` (CGST + SGST), `discountAmount`, `finalAmount`, `paymentMethod`, `paymentStatus`.

### 6. AutomationWorkflow & AutomationLog
- **AutomationWorkflow**: `name`, `triggerEvent`, `conditions` (JSON), `actions` (JSON), `isActive`.
- **AutomationLog**: `workflowId`, `triggerEvent`, `status`, `executionDetails` (JSON), `createdAt`.

---

## JSON Field Schema Specifications

### `MenuItem.recipe`
```json
{
  "ingredients": [
    { "name": "Coffee Beans", "quantity": "18g" },
    { "name": "Steamed Milk", "quantity": "200ml" }
  ],
  "prepTimeMinutes": 5
}
```

### `Bill.taxDetails`
```json
{
  "cgstRate": 2.5,
  "cgstAmount": 12.50,
  "sgstRate": 2.5,
  "sgstAmount": 12.50,
  "totalTax": 25.00
}
```
