const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const p = new PrismaClient();

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://3adbce55d29db1e11460292639d78918.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: 'd049693d600532075fcb5e08fad3bf9b',
    secretAccessKey: '346570f824e57bc66981a9ef68249ffbb75d3eda574886b0bb15e8a068abb384',
  },
});

const BUCKET = 'home-service-storage';
const PUBLIC_BASE = 'https://pub-a3be33960a904a3b9fa7b7a2617e8150.r2.dev';

function makeSvgDoc(type, name) {
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f0f4ff"/>
  <rect x="50" y="50" width="700" height="500" rx="20" fill="white" stroke="#6366f1" stroke-width="3"/>
  <text x="400" y="120" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold" fill="#1e1b4b">HOMEZY VERIFIED DOCUMENT</text>
  <line x1="50" y1="140" x2="750" y2="140" stroke="#e0e7ff" stroke-width="2"/>
  <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="24" fill="#4338ca">${type}</text>
  <text x="400" y="260" text-anchor="middle" font-family="Arial" font-size="18" fill="#374151">Provider: ${name}</text>
  <text x="400" y="310" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Document Status: VERIFIED</text>
  <text x="400" y="360" text-anchor="middle" font-family="Arial" font-size="14" fill="#9ca3af">Issued: ${new Date().toDateString()}</text>
  <rect x="200" y="420" width="400" height="80" rx="10" fill="#6366f1"/>
  <text x="400" y="470" text-anchor="middle" font-family="Arial" font-size="16" fill="white" font-weight="bold">Homezy Home Services Pvt Ltd</text>
  </svg>`;
}

async function uploadDoc(providerId, docType, providerName) {
  const key = `kyc/${providerId}/${docType}.svg`;
  const svg = Buffer.from(makeSvgDoc(docType, providerName));
  
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: svg,
    ContentType: 'image/svg+xml',
  }));
  
  return `${PUBLIC_BASE}/${key}`;
}

async function main() {
  const providers = await p.provider.findMany({
    include: { documents: true },
  });

  console.log(`Found ${providers.length} providers`);

  for (const provider of providers) {
    const existingTypes = new Set(provider.documents.map(d => d.type));
    const docTypes = ['ID_PROOF', 'ADDRESS_PROOF'];

    for (const type of docTypes) {
      if (!existingTypes.has(type)) {
        console.log(`Uploading ${type} for ${provider.name}...`);
        try {
          const fileUrl = await uploadDoc(provider.id, type, provider.name || 'Provider');
          await p.providerDocument.create({
            data: {
              providerId: provider.id,
              type: type,
              fileUrl: fileUrl,
              status: 'PENDING',
            },
          });
          console.log(`  -> Created: ${fileUrl}`);
        } catch (e) {
          console.error(`  -> Failed: ${e.message}`);
        }
      } else {
        console.log(`  ${type} already exists for ${provider.name}`);
      }
    }
  }

  console.log('\nFinal verification:');
  const allDocs = await p.providerDocument.findMany({
    include: { provider: { select: { name: true } } },
    orderBy: { uploadedAt: 'desc' },
  });
  console.log(`Total documents in DB: ${allDocs.length}`);
  allDocs.forEach(d => {
    console.log(`  ${d.provider?.name} | ${d.type} | ${d.status} | ${d.fileUrl.substring(0, 60)}...`);
  });
}

main()
  .catch(e => { console.error('Error:', e.message); })
  .finally(() => p.$disconnect());
