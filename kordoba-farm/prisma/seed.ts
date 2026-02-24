import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "https://picsum.photos/600/400";

async function main() {
  const readyDate = new Date();
  readyDate.setDate(readyDate.getDate() + 14);

  const products: Array<{
    tagNumber: string;
    productType: string;
    breed: string;
    weight: number;
    gender: string;
    age: number;
    pricePerKg: number;
    imageUrl: string;
  }> = [
    // --- Half Goat (2 variations) ---
    { tagNumber: "KF-HG-01", productType: "half_goat", breed: "Boer", weight: 10, gender: "male", age: 8, pricePerKg: 52, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-HG-02", productType: "half_goat", breed: "Kalahari", weight: 11, gender: "female", age: 9, pricePerKg: 50, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-HG-03", productType: "half_goat", breed: "Boer", weight: 9.5, gender: "male", age: 7, pricePerKg: 54, imageUrl: PLACEHOLDER_IMAGE },
    // --- Half Sheep (2 variations) ---
    { tagNumber: "KF-HS-01", productType: "half_sheep", breed: "Dorper", weight: 12, gender: "male", age: 10, pricePerKg: 48, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-HS-02", productType: "half_sheep", breed: "Blackhead Persian", weight: 11, gender: "female", age: 9, pricePerKg: 46, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-HS-03", productType: "half_sheep", breed: "Dorper", weight: 13, gender: "male", age: 11, pricePerKg: 47, imageUrl: PLACEHOLDER_IMAGE },
    // --- Whole Goat (2 variations) ---
    { tagNumber: "KF-WG-01", productType: "whole_goat", breed: "Boer", weight: 28, gender: "male", age: 12, pricePerKg: 48, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-WG-02", productType: "whole_goat", breed: "Kalahari", weight: 32, gender: "male", age: 14, pricePerKg: 46, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-WG-03", productType: "whole_goat", breed: "Boer", weight: 26, gender: "female", age: 11, pricePerKg: 50, imageUrl: PLACEHOLDER_IMAGE },
    // --- Whole Sheep (2 variations) ---
    { tagNumber: "KF-WS-01", productType: "whole_sheep", breed: "Dorper", weight: 42, gender: "male", age: 12, pricePerKg: 45, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-WS-02", productType: "whole_sheep", breed: "Blackhead Persian", weight: 38, gender: "female", age: 11, pricePerKg: 44, imageUrl: PLACEHOLDER_IMAGE },
    { tagNumber: "KF-WS-03", productType: "whole_sheep", breed: "Dorper", weight: 40, gender: "male", age: 12, pricePerKg: 46, imageUrl: PLACEHOLDER_IMAGE },
  ];

  for (const a of products) {
    await prisma.animal.upsert({
      where: { tagNumber: a.tagNumber },
      update: { productType: a.productType },
      create: {
        ...a,
        status: "available",
        readyDate,
      },
    });
  }

  console.log("Seed completed: 4 products (half goat, half sheep, whole goat, whole sheep) with 12 variations total.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
