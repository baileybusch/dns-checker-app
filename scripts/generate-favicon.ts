import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const sizes = [16, 32, 180, 192, 512];
const inputSvg = join(process.cwd(), 'public', 'icons', 'favicon.svg');
const outputDir = join(process.cwd(), 'public', 'icons');

async function generateFavicons() {
  try {
    await mkdir(outputDir, { recursive: true });
    
    for (const size of sizes) {
      const outputName = size === 180 
        ? 'apple-touch-icon.png'
        : size === 192 
        ? 'android-chrome-192x192.png'
        : size === 512
        ? 'android-chrome-512x512.png'
        : `favicon-${size}x${size}.png`;
        
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(join(outputDir, outputName));
        
      console.log(`Generated ${outputName}`);
    }
    
    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons(); 