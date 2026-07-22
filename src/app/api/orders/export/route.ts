import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (from || to) {
      where.createdAt = {
        gte: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lte: to ? new Date(to) : new Date(),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        table: { select: { number: true } },
        bill: true,
      },
    });

    const headers = [
      "Invoice No",
      "Order No",
      "Date",
      "Customer",
      "Customer Email",
      "Table No",
      "Order Type",
      "Items Summary",
      "Subtotal (INR)",
      "Service Charge (INR)",
      "Delivery Fee (INR)",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Order Status",
    ];

    const rows = orders.map((order) => {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      const itemsSummary = Array.isArray(items)
        ? items.map((i) => `${i.qty || 1}x ${i.menuItemName || i.menuItemId}`).join(" + ")
        : "N/A";

      const subtotal = Array.isArray(items)
        ? items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice * (i.qty || 1)) || 0), 0)
        : 0;

      const payments = (typeof order.bill?.payments === "string"
        ? JSON.parse(order.bill.payments)
        : order.bill?.payments) as any[];

      const payMethod = Array.isArray(payments) && payments[0]?.method ? payments[0].method : "CASH";

      return [
        `"${order.bill?.billNumber || `INV-${order.orderNumber.slice(-8)}`}"`,
        `"${order.orderNumber}"`,
        `"${new Date(order.createdAt).toLocaleString()}"`,
        `"${order.user?.name || "Guest"}"`,
        `"${order.user?.email || "N/A"}"`,
        `"${order.table?.number || "N/A"}"`,
        `"${order.type}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        subtotal.toFixed(2),
        (order.bill?.serviceCharge || 0).toFixed(2),
        (order.deliveryFee || 0).toFixed(2),
        (order.bill?.total || subtotal).toFixed(2),
        `"${payMethod}"`,
        `"${order.bill?.status || "UNPAID"}"`,
        `"${order.status}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const fileName = `addadotcom-orders-report-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new Response("Failed to generate export file", { status: 500 });
  }
}
