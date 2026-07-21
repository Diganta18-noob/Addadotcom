import { z } from 'zod';

const OrderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID required'),
  menuItemName: z.string().min(1, 'Menu item name required'),
  qty: z.number().int().positive('Quantity must be at least 1'),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  variant: z.any().optional(),
  addons: z.array(z.any()).optional().default([]),
  note: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least 1 item'),
  tableId: z.string().optional(),
  reservationId: z.string().optional(),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryFee: z.number().min(0).optional().default(0),
  promoCode: z.string().optional(),
  tip: z.number().min(0).optional().default(0),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'SERVED',
    'OUT_FOR_DELIVERY',
    'COMPLETED',
    'CANCELLED',
  ]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
