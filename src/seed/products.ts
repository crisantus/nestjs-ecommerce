
import { prismaClient } from "..";
async function main() {
  await prismaClient.product.deleteMany(); // Clear previous

  const productsData = [];

  for (let i = 1; i <= 100; i++) {
    productsData.push({
      name: `Product ${i}`,
      description: `Description for Product ${i}`,
      price: parseFloat((Math.random() * 100 + 1).toFixed(2)), // use parseFloat for Decimal
      tags: `tag${i},sample`
    });
  }

  await prismaClient.product.createMany({
    data: productsData,
  });

  console.log("✅ Seeded 100 products.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
