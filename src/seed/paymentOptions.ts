import { prismaClient } from "..";



async function main() {
  const paymentOptions = [
    { name: 'Paystack' },
    { name: 'Flutterwave' },
  ];

  for (const option of paymentOptions) {
    const exists = await  prismaClient.paymentOption.findFirst({
      where: { name: option.name },
    });

    if (!exists) {
      await  prismaClient.paymentOption.create({ data: option });
      console.log(`Added payment option: ${option.name}`);
    } else {
      console.log(`Payment option already exists: ${option.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error seeding payment options:', e);
    process.exit(1);
  })
  .finally(async () => {
    await  prismaClient.$disconnect();
  });
