// imageCompression.js
const sharp = require('sharp');

exports.ImageCompressor = async (inputFileBuffer, quality = 80) => {
    try {
        // Compress the image buffer
        const compressedBuffer = await sharp(inputFileBuffer)
            .jpeg({ quality: quality }) // You can change to 'webp' or other formats if needed
            .withMetadata()
            .toBuffer();

        // console.log('Compression successful.');

        return compressedBuffer;
    } catch (error) {
        console.error('Error compressing file:', error.message);
        throw error; // Re-throw the error to handle it in the calling code
    }
}
