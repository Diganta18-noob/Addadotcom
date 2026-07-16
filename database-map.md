# Database Architecture — AddaDotCom

This document describes the schema definition, fields, enums, relations, and integrity rules of the SQLite database.

---

## 🔠 Database Enums

### `UserRole`
- `CUSTOMER` (Default role for standard web users)
- `STAFF` (Cashiers and waiters)
- `MANAGER` (Supervisor/Manager controls)
- `ADMIN` (Full dashboard access)

### `TableStatus`
- `FREE` (Available for seating/reservations)
- `RESERVED` (Scheduled for booking)
- `OCCUPIED` (Guests currently seated, orders active)
- `BILL_REQUESTED` (Billing sequence triggered)
- `NEEDS_CLEANING` (Order completed, table needs clearing)

### `TableZone`
- `INDOOR` (Inside dining)
- `OUTDOOR` (Patios/Sidewalk)
- `TERRACE` (Roof dining)

### `ReservationStatus`
- `PENDING` (Awaiting confirmation)
- `CONFIRMED` (Table locked and ready)
- `SEATED` (Guests arrived and seated)
- `COMPLETED` (Dining session completed)
- `CANCELLED` (Cancelled by guest/staff)
- `NO_SHOW` (Guest failed to arrive)

### `OrderType`
- `DINE_IN` (Served at a tables)
- `TAKEAWAY` (Packaged for pickup)
- `DELIVERY` (Shipped to customer address)

### `OrderStatus`
- `PLACED` (Order received)
- `ACCEPTED` (Order accepted by kitchen)
- `PREPARING` (Chef cooking)
- `READY` (Plated for serving/pickup)
- `SERVED` (Delivered to table)
- `OUT_FOR_DELIVERY` (Shipped via courier)
- `COMPLETED` (Session completed)
- `CANCELLED` (Cancelled order)

### `BillStatus`
- `UNPAID` (Bill generated, unpaid)
- `PAID` (Settled)
- `REFUNDED` (Returned)
- `VOID` (Nullified)

### `PromoType`
- `PERCENTAGE` (Rate off, e.g., 10%)
- `FIXED` (Absolute amount off, e.g., ₹50)

---

## 🗂️ Table Schema Definitions

### `users` (`User`)
Holds authorization profiles, credentials, and customer analytics.
- **`id`** (String, Primary Key, cuid)
- **`name`** (String)
- **`email`** (String, Unique)
- **`emailVerified`** (DateTime?)
- **`phone`** (String?)
- **`passwordHash`** (String?, hashed using bcrypt)
- **`image`** (String?)
- **`role`** (UserRole, default: `CUSTOMER`)
- **`loyaltyPoints`** (Int, default: 0)
- **`createdAt`** (DateTime, default: now)
- **`updatedAt`** (DateTime)
- **Relational References:**
  - One-to-Many: `Address`, `Order`, `Reservation`
  - One-to-Many (Self alias): `Bill` as Cashier (`CashierBills` relation)
  - One-to-Many: NextAuth tables (`Account`, `Session`)

### `accounts` (`Account`)
NextAuth OAuth account bindings.
- **`id`** (String, Primary Key, cuid)
- **`userId`** (String, Foreign Key -> `users.id` CASCADE)
- **`type`** (String)
- **`provider`** (String)
- **`providerAccountId`** (String)
- **`refresh_token`** (String?)
- **`access_token`** (String?)
- **`expires_at`** (Int?)
- **`token_type`** (String?)
- **`scope`** (String?)
- **`id_token`** (String?)
- **`session_state`** (String?)
- **Constraints:** Unique index on `[provider, providerAccountId]`

### `sessions` (`Session`)
NextAuth session tracking.
- **`id`** (String, Primary Key, cuid)
- **`sessionToken`** (String, Unique)
- **`userId`** (String, Foreign Key -> `users.id` CASCADE)
- **`expires`** (DateTime)

### `verification_tokens` (`VerificationToken`)
NextAuth passwordless tokens.
- **`identifier`** (String)
- **`token`** (String, Unique)
- **`expires`** (DateTime)
- **Constraints:** Unique index on `[identifier, token]`

### `addresses` (`Address`)
Customer shipping delivery profile.
- **`id`** (String, Primary Key, cuid)
- **`userId`** (String, Foreign Key -> `users.id` CASCADE)
- **`label`** (String, default: "Home")
- **`street`** (String)
- **`city`** (String)
- **`state`** (String?)
- **`postalCode`** (String)
- **`phone`** (String?)
- **`isDefault`** (Boolean, default: false)

### `categories` (`Category`)
- **`id`** (String, Primary Key, cuid)
- **`name`** (String)
- **`slug`** (String, Unique)
- **`image`** (String?)
- **`sortOrder`** (Int, default: 0)
- **Relational References:**
  - One-to-Many: `MenuItem`

### `menu_items` (`MenuItem`)
- **`id`** (String, Primary Key, cuid)
- **`categoryId`** (String, Foreign Key -> `categories.id` CASCADE)
- **`name`** (String)
- **`slug`** (String, Unique)
- **`description`** (String?)
- **`price`** (Float)
- **`image`** (String?)
- **`tags`** (String, default: ""): Comma-separated string of dietary indicators (e.g. `"VEG,SPICY"`).
- **`isAvailable`** (Boolean, default: true)
- **`prepTime`** (Int?): Cooking time in minutes.
- **`sortOrder`** (Int, default: 0)
- **`isSpecial`** (Boolean, default: false)
- **`isBestseller`** (Boolean, default: false)
- **`variants`** (Json, default: "[]"): Selected size modifications.
- **`addons`** (Json, default: "[]"): Available side additions.
- **`recipe`** (Json, default: "[]"): Raw stock weight maps for automatic inventory deduction.

### `cafe_tables` (`CafeTable`)
- **`id`** (String, Primary Key, cuid)
- **`number`** (Int, Unique)
- **`capacity`** (Int)
- **`zone`** (TableZone, default: `INDOOR`)
- **`status`** (TableStatus, default: `FREE`)
- **Relational References:**
  - One-to-Many: `Reservation`, `Order`

### `reservations` (`Reservation`)
- **`id`** (String, Primary Key, cuid)
- **`userId`** (String?, Foreign Key -> `users.id` NULL)
- **`guestName`** (String)
- **`guestEmail`** (String?)
- **`guestPhone`** (String)
- **`date`** (DateTime)
- **`timeSlot`** (String): E.g., `"19:00"`.
- **`duration`** (Int, default: 90)
- **`partySize`** (Int)
- **`tableId`** (String?, Foreign Key -> `cafe_tables.id` NULL)
- **`status`** (ReservationStatus, default: `PENDING`)
- **`bookingCode`** (String, Unique): Format `BK-XXXXXX`.
- **`notes`** (String?)
- **Relational References:**
  - One-to-Many: `Order`

### `orders` (`Order`)
- **`id`** (String, Primary Key, cuid)
- **`orderNumber`** (String, Unique): Format `ORD-YYYYMMDD-XXXX`.
- **`userId`** (String?, Foreign Key -> `users.id` NULL)
- **`type`** (OrderType)
- **`tableId`** (String?, Foreign Key -> `cafe_tables.id` NULL)
- **`reservationId`** (String?, Foreign Key -> `reservations.id` NULL)
- **`status`** (OrderStatus, default: `PLACED`)
- **`notes`** (String?)
- **`deliveryAddress`** (String?)
- **`deliveryFee`** (Float, default: 0)
- **`pickupTime`** (DateTime?)
- **`items`** (Json): Array of basket items including MenuItem detail, variant details, and addons.
- **Relational References:**
  - One-to-One: `Bill`

### `bills` (`Bill`)
- **`id`** (String, Primary Key, cuid)
- **`billNumber`** (String, Unique): Format `BILL-YYYYMMDD-XXXX`.
- **`orderId`** (String, Unique, Foreign Key -> `orders.id` ON DELETE RESTRICT)
- **`subtotal`** (Float)
- **`serviceCharge`** (Float, default: 0)
- **`serviceChargeRate`** (Float, default: 0)
- **`total`** (Float)
- **`roundingAdj`** (Float, default: 0)
- **`status`** (BillStatus, default: `UNPAID`)
- **`cashierId`** (String?, Foreign Key -> `users.id` NULL)
- **`refundReason`** (String?)
- **`pdfUrl`** (String?)
- **`discounts`** (Json, default: "[]"): Applied coupons list.
- **`taxes`** (Json, default: "[]"): CGST/SGST lists.
- **`payments`** (Json, default: "[]"): Transaction lists (Cash, Card, UPI).
- **`splitConfig`** (Json?): Split configuration parameters.

### `inventory_items` (`InventoryItem`)
- **`id`** (String, Primary Key, cuid)
- **`name`** (String)
- **`unit`** (String): E.g., `kg`, `liters`, `pieces`.
- **`quantity`** (Float, default: 0)
- **`lowStockThreshold`** (Float, default: 0)
- **Relational References:**
  - One-to-Many: `StockLog`

### `stock_logs` (`StockLog`)
- **`id`** (String, Primary Key, cuid)
- **`inventoryItemId`** (String, Foreign Key -> `inventory_items.id` CASCADE)
- **`change`** (Float): Delta change.
- **`reason`** (String)
- **`createdBy`** (String?)
- **`createdAt`** (DateTime, default: now)

### `promo_codes` (`PromoCode`)
- **`id`** (String, Primary Key, cuid)
- **`code`** (String, Unique)
- **`type`** (PromoType)
- **`value`** (Float)
- **`minOrder`** (Float, default: 0)
- **`maxDiscount`** (Float?)
- **`expiresAt`** (DateTime?)
- **`usageLimit`** (Int?)
- **`usageCount`** (Int, default: 0)
- **`isActive`** (Boolean, default: true)

### `settings` (`Setting`)
- **`key`** (String, Primary Key)
- **`value`** (String)
- **`group`** (String, default: "general")

---

## 📈 Entity Relationships Map

```
  [User] ──(1:N)──► [Address]
  [User] ──(1:N)──► [Order]
  [User] ──(1:N)──► [Reservation]
  [User] ──(1:N)──► [Bill] (As Cashier)

  [Category] ──(1:N)──► [MenuItem]

  [CafeTable] ──(1:N)──► [Reservation]
  [CafeTable] ──(1:N)──► [Order]

  [Reservation] ──(1:N)──► [Order]

  [Order] ──(1:1)──► [Bill]

  [InventoryItem] ──(1:N)──► [StockLog]
```
