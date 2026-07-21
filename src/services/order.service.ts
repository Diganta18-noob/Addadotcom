import { prisma } from '../lib/prisma';
import { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.validator';
import { NotFoundError, BadRequestError } from '../errors/AppError';

export class OrderService {
  public static async createOrder(input: CreateOrderInput, userId?: string) {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsJson = input.items.map((item) => ({
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      variant: item.variant || null,
      addons: item.addons || [],
      note: item.note || '',
    }));

    const subtotal = itemsJson.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceCharge = input.type === 'DINE_IN' ? subtotal * 0.05 : 0;
    const total = subtotal + serviceCharge + (input.deliveryFee || 0) + (input.tip || 0);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        type: input.type as any,
        tableId: input.tableId || null,
        reservationId: input.reservationId || null,
        notes: input.notes || null,
        deliveryAddress: input.deliveryAddress || null,
        deliveryFee: input.deliveryFee || 0,
        items: itemsJson as any,
        status: 'PLACED',
      },
    });

    if (input.tableId && input.type === 'DINE_IN') {
      await prisma.cafeTable.update({
        where: { id: input.tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    const billNumber = `INV-${Date.now()}`;
    await prisma.bill.create({
      data: {
        billNumber,
        orderId: order.id,
        subtotal,
        serviceCharge,
        total,
        status: 'UNPAID',
        taxes: [
          { name: 'CGST', rate: 2.5, amount: subtotal * 0.025 },
          { name: 'SGST', rate: 2.5, amount: subtotal * 0.025 },
        ] as any,
      },
    });

    return order;
  }

  public static async getOrders(status?: string, limit: number = 20) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        table: { select: { number: true, zone: true } },
        bill: true,
      },
    });
  }

  public static async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        table: true,
        bill: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    return order;
  }

  public static async updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
    const existing = await this.getOrderById(id);

    const updated = await prisma.order.update({
      where: { id },
      data: { status: input.status as any },
    });

    if (input.status === 'COMPLETED' && existing.tableId) {
      await prisma.cafeTable.update({
        where: { id: existing.tableId },
        data: { status: 'NEEDS_CLEANING' },
      });
    }

    return updated;
  }
}
