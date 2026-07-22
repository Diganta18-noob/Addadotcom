import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ingredients = [
  { name: "Espresso Beans", unit: "kg", quantity: 10, lowStockThreshold: 2 },
  { name: "Whole Milk", unit: "liters", quantity: 20, lowStockThreshold: 5 },
  { name: "Oat Milk", unit: "liters", quantity: 8, lowStockThreshold: 2 },
  { name: "Matcha Powder", unit: "grams", quantity: 500, lowStockThreshold: 100 },
  { name: "White Sugar", unit: "kg", quantity: 15, lowStockThreshold: 3 },
  { name: "Unsalted Butter", unit: "kg", quantity: 5, lowStockThreshold: 1 },
  { name: "Bread Flour", unit: "kg", quantity: 25, lowStockThreshold: 5 },
  { name: "Eggs (Tray)", unit: "pieces", quantity: 120, lowStockThreshold: 30 },
  { name: "Heavy Cream", unit: "liters", quantity: 6, lowStockThreshold: 2 },
  { name: "Vanilla Extract", unit: "ml", quantity: 200, lowStockThreshold: 50 },
  { name: "Caramel Sauce", unit: "liters", quantity: 3, lowStockThreshold: 1 },
  { name: "Belgian Dark Chocolate", unit: "kg", quantity: 4, lowStockThreshold: 1 },
  { name: "Avocado", unit: "pieces", quantity: 30, lowStockThreshold: 10 },
  { name: "Sourdough Loaf", unit: "pieces", quantity: 15, lowStockThreshold: 5 },
  { name: "Smoked Chicken Breast", unit: "kg", quantity: 8, lowStockThreshold: 2 },
  { name: "Mozzarella Cheese", unit: "kg", quantity: 5, lowStockThreshold: 1 },
  { name: "Cherry Tomatoes", unit: "kg", quantity: 3, lowStockThreshold: 1 },
  { name: "Mascarpone", unit: "kg", quantity: 2, lowStockThreshold: 0.5 },
  { name: "Ladyfinger Biscuits", unit: "grams", quantity: 800, lowStockThreshold: 200 },
  { name: "Disposable Cups (8oz)", unit: "pieces", quantity: 500, lowStockThreshold: 100 },
];

export async function seedInventory() {
  console.log("Seeding inventory ingredients...");

  // Clean existing logs and inventory items
  await prisma.stockLog.deleteMany({});
  await prisma.inventoryItem.deleteMany({});

  for (const item of ingredients) {
    const created = await prisma.inventoryItem.create({
      data: item,
    });

    if (item.quantity > 0) {
      await prisma.stockLog.create({
        data: {
          inventoryItemId: created.id,
          change: item.quantity,
          reason: "Initial stock seed",
        },
      });
    }
  }

  console.log(`Seeded ${ingredients.length} inventory ingredients successfully.`);
}

if (require.main === module) {
  seedInventory()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
