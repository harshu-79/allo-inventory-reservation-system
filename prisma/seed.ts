import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Warehouses
  const bangaloreWarehouse = await prisma.warehouse.create({
    data: {
      name: "Bangalore Central Warehouse",
      location: "Bangalore",
    },
  });

  const hyderabadWarehouse = await prisma.warehouse.create({
    data: {
      name: "Hyderabad Fulfillment Hub",
      location: "Hyderabad",
    },
  });

  // Create Products
  const airpods = await prisma.product.create({
    data: {
      name: "AirPods Pro",
      description: "Apple wireless earbuds",
    },
  });

  const keyboard = await prisma.product.create({
    data: {
      name: "Mechanical Keyboard",
      description: "RGB mechanical gaming keyboard",
    },
  });

  const mouse = await prisma.product.create({
    data: {
      name: "Gaming Mouse",
      description: "High precision gaming mouse",
    },
  });

  // Create Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: airpods.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 5,
      },
      {
        productId: airpods.id,
        warehouseId: hyderabadWarehouse.id,
        totalStock: 3,
      },
      {
        productId: keyboard.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 4,
      },
      {
        productId: mouse.id,
        warehouseId: hyderabadWarehouse.id,
        totalStock: 6,
      },
    ],
  });

  console.log("✅ Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });