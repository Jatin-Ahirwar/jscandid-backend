// imageCompression.js
const sharp = require('sharp');
const fs = require('fs');


exports.ImageCompressor = async (inputFilePath, outputFilePath, quality = 80) => {
    try {
        // Read the input file
        const inputFileBuffer = fs.readFileSync(inputFilePath);
        
        // Compress the image buffer
        const compressedBuffer = await sharp(inputFileBuffer)
        .jpeg({ quality: quality }) // You can change to 'webp' or other formats if needed
      .toBuffer();

      // Write the compressed buffer to the output file
    fs.writeFileSync(outputFilePath, compressedBuffer);

    console.log(`Compression successful. Output file saved at: ${outputFilePath}`);
    } catch (error) {
        console.error('Error compressing file:', error.message);
    }
}
