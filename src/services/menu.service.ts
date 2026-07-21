import { prisma } from '../lib/prisma';
import { cache } from '../utils/cache';
import { GetMenuQueryInput, CreateMenuItemInput } from '../validators/menu.validator';
import { NotFoundError } from '../errors/AppError';

export class MenuService {
  public static async getMenuItems(query: GetMenuQueryInput) {
    const cacheKey = `menu_list_${JSON.stringify(query)}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { search, category, tags, priceMin, priceMax, isAvailable, page = 1, limit = 12, sort = 'name_asc' } = query;

    const where: any = {};

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    // Fix SQLite array limitation for tags: perform string contains query safely
    if (tags) {
      where.tags = { contains: tags };
    }

    let orderBy: any = { name: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'created_at') orderBy = { createdAt: 'desc' };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.menuItem.count({ where }),
    ]);

    const result = {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    cache.set(cacheKey, result, 300); // 5 min cache
    return result;
  }

  public static async getMenuItemById(id: string) {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!item) {
      throw new NotFoundError(`Menu item with ID ${id} not found`);
    }

    return item;
  }

  public static async createMenuItem(input: CreateMenuItemInput) {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const item = await prisma.menuItem.create({
      data: {
        ...input,
        slug,
      },
    });

    cache.invalidatePattern('menu_list_');
    return item;
  }

  public static async updateMenuItem(id: string, input: Partial<CreateMenuItemInput>) {
    await this.getMenuItemById(id);

    const updated = await prisma.menuItem.update({
      where: { id },
      data: input,
    });

    cache.invalidatePattern('menu_list_');
    return updated;
  }

  public static async deleteMenuItem(id: string) {
    await this.getMenuItemById(id);
    await prisma.menuItem.delete({ where: { id } });
    cache.invalidatePattern('menu_list_');
  }
}
