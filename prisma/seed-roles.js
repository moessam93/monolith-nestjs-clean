// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { key: 'SuperAdmin', nameEn: 'Super Admin', nameAr: 'مشرف عام' },
    { key: 'Admin',      nameEn: 'Admin',       nameAr: 'مشرف'     },
    { key: 'Executive',  nameEn: 'Executive',   nameAr: 'تنفيذي'   },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { key: r.key },
      update: { nameEn: r.nameEn, nameAr: r.nameAr },
      create: r,
    });
  }

  console.log('✅ Seeded Roles: SuperAdmin, Admin, Executive');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
