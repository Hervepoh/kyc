import { prisma } from '../lib/db';

async function main() {
  await prisma.customer.createMany({
    data: [
      {
        contract: 'C001',
        fullName: 'Jean Dupont',
        meter: 'MTR123456',
      },
      {
        contract: 'C002',
        fullName: 'Fatima Ndiaye',
        meter: 'MTR654321',
      },
      {
        contract: 'C003',
        fullName: 'John Doe',
        meter: 'MTR987654',
      },
    ]
  });

  console.log('✔ Données de test insérées dans Contract');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
