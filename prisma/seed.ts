import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records
  await prisma.bill.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.cafeTable.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.promoCode.deleteMany({});
  await prisma.setting.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("admin123", salt);
  const staffPasswordHash = await bcrypt.hash("staff123", salt);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Manager",
      email: "admin@addadotcom.cafe",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Staff Cashier",
      email: "staff@addadotcom.cafe",
      role: "STAFF",
      passwordHash: staffPasswordHash,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Digan",
      email: "digan@gmail.com",
      phone: "+91 98765 43210",
      role: "CUSTOMER",
      loyaltyPoints: 1435,
    },
  });

  console.log("Users created.");

  // 3. Create Categories
  const beverageCategory = await prisma.category.create({
    data: { name: "Coffee & Beverages", slug: "coffee-beverages", sortOrder: 1 },
  });

  const breakfastCategory = await prisma.category.create({
    data: { name: "Breakfast", slug: "breakfast", sortOrder: 2 },
  });

  const mainsCategory = await prisma.category.create({
    data: { name: "Mains", slug: "mains", sortOrder: 3 },
  });

  const dessertsCategory = await prisma.category.create({
    data: { name: "Desserts", slug: "desserts", sortOrder: 4 },
  });

  const specialsCategory = await prisma.category.create({
    data: { name: "Specials", slug: "specials", sortOrder: 5 },
  });

  console.log("Categories created.");

  // 4. Create Menu Items
  const items = [
    // Coffee & Beverages
    {
      categoryId: beverageCategory.id,
      name: "Espresso Bloom",
      slug: "espresso-bloom",
      description: "Our signature double-shot espresso with house-made caramel drizzle",
      price: 249,
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 5,
      isBestseller: true,
      variants: [
        {
          name: "Size",
          options: [
            { label: "Small", priceModifier: 0 },
            { label: "Medium", priceModifier: 40 },
            { label: "Large", priceModifier: 80 },
          ],
        },
      ],
      addons: [
        { name: "Extra Shot", price: 40 },
        { name: "Oat Milk", price: 30 },
      ],
    },
    {
      categoryId: beverageCategory.id,
      name: "Iced Matcha Latte",
      slug: "iced-matcha-latte",
      description: "Premium Japanese matcha whisked with milk, served over ice",
      price: 299,
      image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80",
      tags: ["VEG", "VEGAN"],
      isAvailable: true,
      prepTime: 5,
    },
    {
      categoryId: beverageCategory.id,
      name: "Cold Brew Coffee",
      slug: "cold-brew",
      description: "24-hour cold steeped coffee, smooth and rich",
      price: 219,
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
      tags: ["VEG", "VEGAN"],
      isAvailable: true,
      prepTime: 3,
      isBestseller: true,
    },
    {
      categoryId: beverageCategory.id,
      name: "Rose Chai Latte",
      slug: "rose-chai-latte",
      description: "Indian chai infused with rose, cardamom, and warm spices",
      price: 199,
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 7,
      isSpecial: true,
    },
    {
      categoryId: beverageCategory.id,
      name: "Fresh Orange Juice",
      slug: "fresh-oj",
      description: "Freshly squeezed oranges, no added sugar",
      price: 179,
      image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80",
      tags: ["VEG", "VEGAN", "GLUTEN_FREE"],
      isAvailable: true,
      prepTime: 5,
    },
    {
      categoryId: beverageCategory.id,
      name: "Classic Hot Chocolate",
      slug: "hot-chocolate",
      description: "Belgian dark chocolate melted with marshmallows",
      price: 259,
      image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 6,
    },

    // Breakfast
    {
      categoryId: breakfastCategory.id,
      name: "Caramel French Toast",
      slug: "caramel-french-toast",
      description: "Brioche bread, caramelized banana, maple drizzle, fresh whipped cream",
      price: 349,
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 15,
      isBestseller: true,
    },
    {
      categoryId: breakfastCategory.id,
      name: "Avocado Toast",
      slug: "avocado-toast",
      description: "Sourdough, smashed avocado, cherry tomatoes, feta, poached egg",
      price: 329,
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 10,
    },
    {
      categoryId: breakfastCategory.id,
      name: "Full English Breakfast",
      slug: "full-english",
      description: "Eggs, bacon, sausages, baked beans, grilled tomato, mushrooms, toast",
      price: 449,
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
      tags: ["NON_VEG"],
      isAvailable: true,
      prepTime: 20,
    },
    {
      categoryId: breakfastCategory.id,
      name: "Acai Bowl",
      slug: "acai-bowl",
      description: "Blended acai, granola, fresh berries, chia seeds",
      price: 379,
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80",
      tags: ["VEG", "VEGAN", "GLUTEN_FREE"],
      isAvailable: true,
      prepTime: 8,
    },
    {
      categoryId: breakfastCategory.id,
      name: "Masala Omelette",
      slug: "masala-omelette",
      description: "Three-egg omelette with onions, tomatoes, green chillies, and toast",
      price: 249,
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80",
      tags: ["VEG", "SPICY"],
      isAvailable: true,
      prepTime: 12,
    },

    // Mains
    {
      categoryId: mainsCategory.id,
      name: "Smoked Chicken Panini",
      slug: "smoked-chicken-panini",
      description: "Hickory-smoked chicken, mozzarella, basil pesto on ciabatta",
      price: 399,
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
      tags: ["NON_VEG"],
      isAvailable: true,
      prepTime: 15,
      isBestseller: true,
    },
    {
      categoryId: mainsCategory.id,
      name: "Margherita Pizza",
      slug: "margherita-pizza",
      description: "Wood-fired thin crust, San Marzano tomato sauce, fresh mozzarella, basil",
      price: 449,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 20,
    },
    {
      categoryId: mainsCategory.id,
      name: "Grilled Chicken Salad",
      slug: "grilled-chicken-salad",
      description: "Mixed greens, grilled chicken, avocado, cherry tomatoes, dressing",
      price: 379,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
      tags: ["NON_VEG", "GLUTEN_FREE"],
      isAvailable: true,
      prepTime: 12,
    },
    {
      categoryId: mainsCategory.id,
      name: "Paneer Tikka Wrap",
      slug: "paneer-tikka-wrap",
      description: "Tandoori paneer, mint chutney, salad in a whole wheat wrap",
      price: 329,
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
      tags: ["VEG", "SPICY"],
      isAvailable: true,
      prepTime: 15,
    },
    {
      categoryId: mainsCategory.id,
      name: "Truffle Mushroom Pasta",
      slug: "truffle-mushroom-pasta",
      description: "Penne in creamy truffle sauce with sautéed mushrooms",
      price: 429,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 18,
      isSpecial: true,
    },

    // Desserts
    {
      categoryId: dessertsCategory.id,
      name: "Matcha Tiramisu",
      slug: "matcha-tiramisu",
      description: "Japanese matcha layered with mascarpone cream",
      price: 299,
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 5,
      isBestseller: true,
    },
    {
      categoryId: dessertsCategory.id,
      name: "Molten Chocolate Cake",
      slug: "molten-chocolate",
      description: "Warm Belgian chocolate fondant served with vanilla ice cream",
      price: 349,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 15,
    },
    {
      categoryId: dessertsCategory.id,
      name: "New York Cheesecake",
      slug: "ny-cheesecake",
      description: "Classic creamy cheesecake with berry compote",
      price: 279,
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80",
      tags: ["VEG"],
      isAvailable: true,
      prepTime: 5,
    },
    {
      categoryId: dessertsCategory.id,
      name: "Affogato",
      slug: "affogato",
      description: "Vanilla bean gelato drowned in a shot of hot espresso",
      price: 229,
      image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80",
      tags: ["VEG", "GLUTEN_FREE"],
      isAvailable: true,
      prepTime: 3,
    },

    // Specials
    {
      categoryId: specialsCategory.id,
      name: "Chef's Lamb Burger",
      slug: "chefs-lamb-burger",
      description: "Spiced lamb patty, caramelized onions, cheddar, truffle aioli",
      price: 529,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
      tags: ["NON_VEG", "SPICY"],
      isAvailable: true,
      prepTime: 20,
      isSpecial: true,
    },
    {
      categoryId: specialsCategory.id,
      name: "Saffron Risotto",
      slug: "saffron-risotto",
      description: "Arborio rice slow-cooked with saffron, white wine, parmesan",
      price: 499,
      image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&q=80",
      tags: ["VEG", "GLUTEN_FREE"],
      isAvailable: true,
      prepTime: 25,
      isSpecial: true,
    },
  ];

  for (const item of items) {
    await prisma.menuItem.create({
      data: {
        categoryId: item.categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: item.image,
        tags: item.tags ? item.tags.join(",") : "",
        isAvailable: item.isAvailable,
        prepTime: item.prepTime,
        isBestseller: item.isBestseller || false,
        isSpecial: item.isSpecial || false,
        variants: item.variants || [],
        addons: item.addons || [],
      },
    });
  }

  console.log("Menu items seeded.");

  // 5. Create Tables
  const zones = ["INDOOR", "OUTDOOR", "TERRACE"] as const;
  for (let i = 1; i <= 12; i++) {
    await prisma.cafeTable.create({
      data: {
        number: i,
        capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
        zone: zones[i % 3],
        status: "FREE",
      },
    });
  }

  console.log("Tables seeded.");

  // 6. Create Promo Codes
  await prisma.promoCode.create({
    data: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 150,
      isActive: true,
    },
  });

  await prisma.promoCode.create({
    data: {
      code: "FIRST50",
      type: "FIXED",
      value: 50,
      minOrder: 200,
      isActive: true,
    },
  });

  console.log("Promo codes seeded.");

  // 7. Create settings
  const settings = [
    { key: "cafe_name", value: "AddaDotCom", group: "general" },
    { key: "tax_gst", value: "5", group: "tax" },
    { key: "service_charge", value: "5", group: "tax" },
    { key: "slot_duration", value: "90", group: "reservation" },
    { key: "buffer_time", value: "15", group: "reservation" },
  ];

  for (const s of settings) {
    await prisma.setting.create({
      data: s,
    });
  }

  console.log("Settings seeded.");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
