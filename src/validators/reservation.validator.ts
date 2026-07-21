import { z } from 'zod';

export const CreateReservationSchema = z.object({
  guestName: z.string().min(2, 'Name is required'),
  guestEmail: z.string().email().optional().or(z.literal('')),
  guestPhone: z.string().min(10, 'Valid 10-digit phone number required'),
  date: z.string().min(1, 'Reservation date is required'),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time slot must be HH:mm format'),
  partySize: z.number().int().min(1, 'Party size must be at least 1').max(20, 'For groups over 20, contact cafe'),
  notes: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
