// imageCompression.js
const sharp = require('sharp');

exports.ImageCompressor = async (inputFileBuffer, quality = 80) => {
    try {
        // Compress the image buffer
        const compressedBuffer = await sharp(inputFileBuffer)
            .jpeg({ quality: quality }) // You can change to 'webp' or other formats if needed
            .toBuffer();

        console.log('Compression successful.');

        return compressedBuffer;
    } catch (error) {
        console.error('Error compressing file:', error.message);
        throw error; // Re-throw the error to handle it in the calling code
    }
}



// // imageCompression.js
// const sharp = require('sharp');
// const fs = require('fs');
// const path = require('path');

// exports.ImageCompressor = async (inputFileBuffer, outputFilePath, quality = 80) => {
//     try {
//         const outputDirectory = path.dirname(outputFilePath);

//         // Create the directory if it doesn't exist
//         if (!fs.existsSync(outputDirectory)) {
//             fs.mkdirSync(outputDirectory, { recursive: true });
//         }

//         // Compress the image buffer
//         const compressedBuffer = await sharp(inputFileBuffer)
//             .jpeg({ quality: quality }) // You can change to 'webp' or other formats if needed
//             .toBuffer();

//         // Write the compressed buffer to the output file
//         fs.writeFileSync(outputFilePath, compressedBuffer);

//         console.log(`Compression successful. Output file saved at: ${outputFilePath}`);
//     } catch (error) {
//         console.error('Error compressing file:', error.message);
//         throw error; // Re-throw the error to handle it in the calling code
//     }
// }
