// Script to generate placeholder PWA icons
import fs from 'fs';
import { createCanvas } from 'canvas';

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw green background circle
  ctx.fillStyle = '#10b981';
  ctx.fillRect(0, 0, size, size);

  // Draw white text "TB"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TB', size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${filename}`, buffer);
  console.log(`✓ Generated ${filename} (${size}x${size})`);
}

// Generate icons
generateIcon(512, 'pwa-512x512.png');
generateIcon(192, 'pwa-192x192.png');

console.log('\n✅ PWA icons generated successfully!');
