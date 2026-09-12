const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

async function main() {
  const admins = await p.adminUser.findMany({ select: { id: true, email: true } });
  console.log('Admin users:', JSON.stringify(admins));
  
  const hash = await bcrypt.hash('Admin@1234', 10);
  
  if (admins.length > 0) {
    await p.adminUser.update({ where: { id: admins[0].id }, data: { passwordHash: hash } });
    console.log('Password reset to Admin@1234 for', admins[0].email);
  } else {
    await p.adminUser.create({
      data: { name: 'Homezy Admin', email: 'admin@homezy.in', passwordHash: hash, role: 'SUPER_ADMIN' }
    });
    console.log('Admin user created: admin@homezy.in / Admin@1234');
  }
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e))
  .finally(() => p.$disconnect());
