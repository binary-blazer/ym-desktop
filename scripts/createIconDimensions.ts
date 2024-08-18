/* eslint-disable no-console */
import sharp from 'sharp';
import path from 'path';

const iconPath = path.resolve(__dirname, '../assets/icon.png');
const outputDir = path.resolve(__dirname, '../assets/icons');

const sizes = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];

async function resizeIcon() {
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${size}x${size}.png`);
      // eslint-disable-next-line no-await-in-loop
      await sharp(iconPath).resize(size, size).toFile(outputPath);
      console.log(`Icon resized to ${size}x${size}`);
    }
    console.log('All icons resized successfully!');
  } catch (error) {
    console.error('Error resizing icons:', error);
  }
}

resizeIcon();
