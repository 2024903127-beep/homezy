import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Homezy Production Database ---');

  // 1. Admin User
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@homezy.in';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@1234';

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        name: 'Homezy Super Admin',
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`✓ Admin user created: ${adminEmail} (password: ${adminPassword})`);
  }

  // 2. Categories
  const categoryDefs = [
    { id: 'ac-maintenance', name: 'AC Maintenance', displayOrder: 1 },
    { id: 'electrical', name: 'Electrical', displayOrder: 2 },
    { id: 'plumbing', name: 'Plumbing', displayOrder: 3 },
    { id: 'carpentry', name: 'Carpentry', displayOrder: 4 },
    { id: 'home-cleaning', name: 'Home Cleaning', displayOrder: 5 },
  ];

  for (const cat of categoryDefs) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, displayOrder: cat.displayOrder },
      create: { id: cat.id, name: cat.name, displayOrder: cat.displayOrder },
    });
  }
  console.log('✓ Categories seeded.');

  // 3. Services
  const servicesData = [
    {
      id: 'svc-ac-1',
      categoryId: 'ac-maintenance',
      name: 'AC Foam & Power Jet Service',
      description: 'Deep cleaning of indoor and outdoor AC units with jet pump & anti-bacterial foam.',
      price: 499,
      estimatedDurationMinutes: 60,
      inclusions: ['Indoor & Outdoor unit cleaning', 'Gas pressure check', '30-day warranty'],
      exclusions: ['Spare parts & refrigerant gas refill'],
    },
    {
      id: 'svc-ac-2',
      categoryId: 'ac-maintenance',
      name: 'AC Gas Refill & Leak Fix',
      description: 'Comprehensive leak detection, braising, nitrogen testing & 100% genuine gas recharge.',
      price: 1499,
      estimatedDurationMinutes: 90,
      inclusions: ['Leak diagnosis', 'Gas charging', 'Performance testing'],
      exclusions: ['Compressor replacement'],
    },
    {
      id: 'svc-elec-1',
      categoryId: 'electrical',
      name: 'Switchboard & Socket Repair',
      description: 'Inspection and repair/replacement of malfunctioning switches, MCBs, or heavy appliances.',
      price: 199,
      estimatedDurationMinutes: 45,
      inclusions: ['Safety check', 'Wiring inspection', 'Standard repair'],
      exclusions: ['New switchboard parts'],
    },
    {
      id: 'svc-plumb-1',
      categoryId: 'plumbing',
      name: 'Tap & Mixer Leakage Repair',
      description: 'Fix dripping faucets, washers, valves, and water mixers with expert precision.',
      price: 249,
      estimatedDurationMinutes: 45,
      inclusions: ['Gasket & washer fixes', 'Pressure check', 'Clean finish'],
      exclusions: ['Replacement mixer set'],
    },
    {
      id: 'svc-carp-1',
      categoryId: 'carpentry',
      name: 'Door Lock & Hinge Fitting',
      description: 'Repair stuck doors, align hinges, or install high-security deadbolts.',
      price: 299,
      estimatedDurationMinutes: 60,
      inclusions: ['Precision alignment', 'Lubrication', 'Fitment warranty'],
      exclusions: ['Hardware lock sets'],
    },
    {
      id: 'svc-clean-1',
      categoryId: 'home-cleaning',
      name: 'Complete Bathroom Deep Cleaning',
      description: 'Hard water stain removal, tiles & grouting scrubbing, and chemical sanitization.',
      price: 499,
      estimatedDurationMinutes: 75,
      inclusions: ['Tile buffing', 'Mirror & fixture shining', 'Disinfection'],
      exclusions: ['Paint touchup'],
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: { name: s.name, price: s.price, description: s.description },
      create: s,
    });
  }
  console.log('✓ Services seeded.');

  // 4. Verified & On-Duty Providers
  const providerHash = await bcrypt.hash('Provider@1234', 10);
  const providersData = [
    {
      phone: '9876543210',
      name: 'Amit Kumar',
      email: 'amit.kumar@homezy.in',
      photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200',
      categoryId: 'ac-maintenance',
    },
    {
      phone: '9876543211',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@homezy.in',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      categoryId: 'electrical',
    },
    {
      phone: '9876543212',
      name: 'Suresh Verma',
      email: 'suresh.verma@homezy.in',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      categoryId: 'plumbing',
    },
    {
      phone: '9876543213',
      name: 'Vikram Singh',
      email: 'vikram.singh@homezy.in',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      categoryId: 'carpentry',
    },
    {
      phone: '9876543214',
      name: 'Pooja Patel',
      email: 'pooja.patel@homezy.in',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      categoryId: 'home-cleaning',
    },
  ];

  for (const p of providersData) {
    let prov = await prisma.provider.findUnique({ where: { phone: p.phone } });
    if (!prov) {
      prov = await prisma.provider.create({
        data: {
          phone: p.phone,
          name: p.name,
          email: p.email,
          passwordHash: providerHash,
          photoUrl: p.photoUrl,
          verificationStatus: 'VERIFIED',
          isOnDuty: true,
          isActive: true,
          categories: { connect: { id: p.categoryId } },
        },
      });
    } else {
      await prisma.provider.update({
        where: { id: prov.id },
        data: {
          name: p.name,
          verificationStatus: 'VERIFIED',
          isOnDuty: true,
          isActive: true,
          categories: { connect: { id: p.categoryId } },
        },
      });
    }
  }
  console.log('✓ Verified on-duty providers created.');

  // 5. Default Customer User
  const customerPhone = '9999999999';
  let customer = await prisma.user.findUnique({ where: { phone: customerPhone } });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        phone: customerPhone,
        name: 'Rahul Mishra',
        email: 'rahul@homezy.in',
      },
    });
  }

  // Customer Address
  let address = await prisma.address.findFirst({ where: { userId: customer.id } });
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Home',
        line1: '221B, MG Road, DLF Cyber City',
        line2: 'Sector 24',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        latitude: 28.4908,
        longitude: 77.0917,
        isDefault: true,
      },
    });
  }
  console.log('✓ Customer and Address created.');

  // 6. Initial Seed Booking (bk-1001) - COMPLETED with Invoice Number
  const acProvider = await prisma.provider.findUnique({ where: { phone: '9876543210' } });
  const existingBooking = await prisma.booking.findUnique({ where: { id: 'bk-1001' } });
  if (!existingBooking && acProvider && address) {
    await prisma.booking.create({
      data: {
        id: 'bk-1001',
        customerId: customer.id,
        providerId: acProvider.id,
        serviceId: 'svc-ac-1',
        addressId: address.id,
        scheduledAt: new Date(Date.now() - 24 * 3600 * 1000), // yesterday
        status: 'COMPLETED',
        price: 499,
        paymentMode: 'ONLINE',
        paymentStatus: 'PAID',
        invoiceNumber: 'HMZ-INV-BK1001',
        notes: 'Please clean filters thoroughly.',
      },
    });
    console.log('✓ Real seed booking #bk-1001 created in COMPLETED status with invoice #HMZ-INV-BK1001.');
  }

  console.log('--- All Seed Data Successfully Applied ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
