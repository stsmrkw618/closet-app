const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');

// シンプルなアイコンをSVGで作成
const createIconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#09090b"/>
  <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.22}" fill="#10b981"/>
  <rect x="${size * 0.25}" y="${size * 0.5}" width="${size * 0.5}" height="${size * 0.35}" rx="${size * 0.05}" fill="#10b981"/>
  <rect x="${size * 0.35}" y="${size * 0.35}" width="${size * 0.08}" height="${size * 0.2}" fill="#09090b"/>
  <rect x="${size * 0.57}" y="${size * 0.35}" width="${size * 0.08}" height="${size * 0.2}" fill="#09090b"/>
</svg>
`;

// maskable用（余白を多めに）
const createMaskableSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#09090b"/>
  <circle cx="${size / 2}" cy="${size * 0.42}" r="${size * 0.15}" fill="#10b981"/>
  <rect x="${size * 0.32}" y="${size * 0.5}" width="${size * 0.36}" height="${size * 0.25}" rx="${size * 0.03}" fill="#10b981"/>
  <rect x="${size * 0.40}" y="${size * 0.40}" width="${size * 0.05}" height="${size * 0.13}" fill="#09090b"/>
  <rect x="${size * 0.55}" y="${size * 0.40}" width="${size * 0.05}" height="${size * 0.13}" fill="#09090b"/>
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');

  // 192x192
  await sharp(Buffer.from(createIconSvg(192)))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ icon-192.png');

  // 512x512
  await sharp(Buffer.from(createIconSvg(512)))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ icon-512.png');

  // maskable 512x512
  await sharp(Buffer.from(createMaskableSvg(512)))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable.png'));
  console.log('✓ icon-maskable.png');

  console.log('Done!');
}

generateIcons().catch(console.error);
