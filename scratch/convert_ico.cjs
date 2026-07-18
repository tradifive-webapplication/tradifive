const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '../public/favicon.png');
const icoPath = path.join(__dirname, '../public/favicon.ico');

try {
  console.log('Reading PNG file:', pngPath);
  const pngBuffer = fs.readFileSync(pngPath);

  // Parse width and height from PNG IHDR chunk (starts at offset 12, length 4, name 'IHDR', then 4 bytes width, 4 bytes height)
  const width = pngBuffer.readUInt32BE(16);
  const height = pngBuffer.readUInt32BE(20);
  console.log(`PNG Dimensions: ${width}x${height}`);

  // Construct ICO header
  const icoHeader = Buffer.alloc(22);
  
  // ICO Header (6 bytes)
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type: 1 = Icon
  icoHeader.writeUInt16LE(1, 4); // Count: 1 image

  // Icon Directory Entry (16 bytes)
  icoHeader.writeUInt8(width >= 256 ? 0 : width, 6);   // Width
  icoHeader.writeUInt8(height >= 256 ? 0 : height, 7); // Height
  icoHeader.writeUInt8(0, 8); // Color count (0 if >= 8bpp)
  icoHeader.writeUInt8(0, 9); // Reserved
  icoHeader.writeUInt16LE(1, 10); // Color planes
  icoHeader.writeUInt16LE(32, 12); // Bits per pixel
  icoHeader.writeUInt32LE(pngBuffer.length, 14); // Size of image data
  icoHeader.writeUInt32LE(22, 18); // Offset of image data (6 + 16 = 22)

  // Combine header and PNG data
  const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);

  fs.writeFileSync(icoPath, icoBuffer);
  console.log('Successfully created ICO file at:', icoPath);
} catch (error) {
  console.error('Failed to create ICO file:', error);
  process.exit(1);
}
