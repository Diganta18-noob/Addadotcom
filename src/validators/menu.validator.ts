import { z } from 'zod';

export const GetMenuQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  isAvailable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_at']).optional().default('name_asc'),
});

export const CreateMenuItemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  description: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
  tags: z.string().optional().default(''),
  prepTime: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional().default(true),
  isSpecial: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false),
  variants: z.array(z.any()).optional().default([]),
  addons: z.array(z.any()).optional().default([]),
  recipe: z.array(z.any()).optional().default([]),
});

export type GetMenuQueryInput = z.infer<typeof GetMenuQuerySchema>;
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
