import { prisma } from '../lib/db';
import fs from 'fs';
import csvParser from 'csv-parser'; // compatible avec séparateurs custom


async function main() {
  const customers: any[] = [];

  // Lire le CSV avec # comme séparateur
  fs.createReadStream('./prisma/contracts.csv')
    .pipe(csvParser({ separator: '#' }))
    .on('data', (row) => {
      // Nettoyage et conversion simple des champs
      // console.log("first row", row);
      customers.push({
        contract: row['CONTRACT']?.trim() ?? '',
        meter: row['METER']?.replace(/"/g, '').trim() || null,
        lastName: row['LASTNAME']?.trim() || null,
        firstName: row['FIRSTNAME']?.trim() || null,
        fullName: row['FULLNAME']?.trim() || '',
        status: row['STATUT']?.trim() || null,
        type: row['TYPE']?.trim() || null,
        idType: null,
        idNumber: null,
        idValidityDate: null,
        nui: null,
        phone: null,
        email: null,
        address: null,
        locationReference: null,
        gpsCoordinates: null,
      });
    })
    .on('end', async () => {
      console.log(`Import ${customers.length} customers...`);
      // console.log(customers)
      for (const cust of customers) {
        try {
          await prisma.customer.upsert({
            where: { contract: cust.contract },
            update: cust,
            create: cust,
          });
        } catch (e) {
          console.error(`Failed to import contract ${cust.contract}`, e);
        }
      }

      console.log('Import terminé');
      await prisma.$disconnect();
    });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});


// async function main() {
//   await prisma.customer.createMany({
//     data: [
//       {
//         contract: 'C001',
//         fullName: 'Jean Dupont',
//         meter: 'MTR123456',
//       },
//       {
//         contract: 'C002',
//         fullName: 'Fatima Ndiaye',
//         meter: 'MTR654321',
//       },
//       {
//         contract: 'C003',
//         fullName: 'John Doe',
//         meter: 'MTR987654',
//       },
//     ]
//   });

//   console.log('✔ Données de test insérées dans Contract');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
