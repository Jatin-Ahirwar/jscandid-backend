// const ffmpeg = require('fluent-ffmpeg');

// exports.VideoCompressor = (inputVideoPath, outputVideoPath, bitrate = '500k') => {
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputVideoPath)
//             .videoBitrate(bitrate)
//             .on('end', () => {
//                 console.log('Video compressed successfully');
//                 resolve();
//             })
//             .on('error', (err) => {
//                 console.error('Error compressing video:', err);
//                 reject(err);
//             })
//             .save(outputVideoPath);
//     });
// };


// const ffmpeg = require('fluent-ffmpeg');

// exports.VideoCompressor = (inputVideoBuffer, bitrate = '500k') => {
//     return new Promise((resolve, reject) => {
//         // Input video buffer is provided instead of a file path
//         ffmpeg()
//             .input(inputVideoBuffer)
//             .videoBitrate(bitrate)
//             .inputFormat('mp4')  // Specify the input format if necessary
//             .on('end', (stdout, stderr) => {
//                 console.log('Video compressed successfully');
//                 // Instead of saving, resolve with the buffer
//                 resolve(stdout);
//             })
//             .on('error', (err) => {
//                 console.error('Error compressing video:', err);
//                 reject(err);
//             })
//             .toFormat('mp4')  // Specify the output format if necessary
//             .toFormat('mp4')  // Specify the output format if necessary
//             .pipe();
//     });
// };
// const { Readable } = require('stream');
// const ffmpeg = require('fluent-ffmpeg');

// exports.VideoCompressor = (inputVideoBuffer, bitrate = '500k') => {
//     return new Promise((resolve, reject) => {
//         const inputBufferStream = new Readable();
//         inputBufferStream._read = () => {};
//         inputBufferStream.push(inputVideoBuffer);
//         inputBufferStream.push(null);

//         ffmpeg()
//             .input(inputBufferStream)
//             .inputFormat('mp4')  // Specify the input format
//             .videoBitrate(bitrate)
//             .on('end', (stdout, stderr) => {
//                 console.log('Video compressed successfully');
//                 // Instead of saving, resolve with the buffer
//                 resolve(stdout);
//             })
//             .on('error', (err) => {
//                 console.error('Error compressing video:', err);
//                 reject(err);
//             })
//             .toFormat('mp4')  // Specify the output format if necessary
//             .pipe();
//     });
// };



// const { Readable } = require('stream');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// ffmpeg.setFfmpegPath(ffmpegPath);

// exports.VideoCompressor = (inputVideoBuffer, bitrate = '500k') => {
//     return new Promise((resolve, reject) => {
//         const inputBufferStream = new Readable();
//         inputBufferStream._read = () => {};
//         inputBufferStream.push(inputVideoBuffer);
//         inputBufferStream.push(null);

//         ffmpeg()
//             .toFormat('mp4')
//             .input(inputBufferStream)
//             .videoBitrate(bitrate)
//             .on('end', (stdout, stderr) => {
//                 console.log('Video compressed successfully');
//                 resolve(Buffer.from(stdout));
//             })
//             .on('error', (err) => {
//                 console.error('Error compressing video:', err);
//                 reject(err);
//             })
//             .toFormat('mp4')  // Specify the output format if necessary
//             .pipe();
//     });
// };



// const ffmpeg = require('fluent-ffmpeg');
// const { Readable, Writable } = require('stream');  // Import Readable and Writable from the stream module

// exports.VideoCompressor = (inputVideoBuffer, quality = 30, bitrate = 1000000) => {
//     return new Promise((resolve, reject) => {
//         // Create a readable stream from the input buffer
//         const inputStream = new Readable();
//         inputStream.push(inputVideoBuffer);
//         inputStream.push(null);  // Signal the end of the stream

//         // Set input options
//         const inputOptions = { source: inputStream };

//         // Set output options
//         const outputOptions = { format: 'mp4', videoCodec: 'libx264', quality: quality, videoBitrate: bitrate };

//         // Create a writable stream to capture the output buffer
//         const outputStream = new Writable();
//         const buffers = [];
//         outputStream._write = (chunk, encoding, callback) => {
//             buffers.push(chunk);
//             callback();
//         };
//         console.log(inputVideoBuffer)
//         // Use ffmpeg to process the input stream
//         ffmpeg()
//             .input(inputOptions)
//             .inputFormat('mp4')  // Specify the input video format if necessary
//             .outputOptions(outputOptions)
//             .pipe(outputStream)
//             .on('finish', () => {
//                 const compressedBuffer = Buffer.concat(buffers);
//                 console.log('Video compression successful.');
//                 resolve(compressedBuffer);
//             })
//             .on('error', (err) => {
//                 console.error('Error compressing video:', err);
//                 reject(err);
//             });
//     });
// };




// const videoConverter = require('videoconverter');

// exports.VideoCompressor = async (inputVideoBuffer, quality = 30, bitrate = 1000000) => {
//     try {
//         // Convert video buffer with compression options
//         const compressedBuffer = await videoConverter.compress({
//             input: inputVideoBuffer,
//             quality: quality,
//             bitrate: bitrate,
//         });

//         console.log('Video compression successful.');

//         return compressedBuffer;
//     } catch (error) {
//         console.error('Error compressing video:', error.message);
//         throw error;
//     }
// };



// const fs = require('fs');
// const sharp = require('sharp');
// const ffmpegPath = require('ffmpeg-static');
// const { execFile } = require('child_process');
// export const VideoCompressor = async (inputVideoBuffer, quality = 30, bitrate = 1000000) => {
//   try {
//     const compressedBuffer = await compressVideoBuffer(inputVideoBuffer, quality, bitrate);
//     console.log('Video compression successful.');
//     return compressedBuffer;
//   } catch (error) {
//     console.error('Error compressing video:', error.message);
//     throw error;
//   }
// };

// async function compressVideoBuffer(inputVideoBuffer, quality, bitrate) {
//   const ffmpegCommand = [
//     '-i', 'pipe:0', // Input from stdin
//     '-c:v', 'libx264',
//     '-b:v', `${bitrate}k`,
//     '-crf', quality.toString(),
//     '-f', 'mp4',
//     'pipe:1', // Output to stdout
//   ];

//   return new Promise((resolve, reject) => {
//     const ffmpegProcess = execFile(ffmpegPath, ffmpegCommand, { encoding: 'binary', maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
//       if (error) {
//         console.error('Error compressing video:', stderr);
//         reject(error);
//       } else {
//         resolve(Buffer.from(stdout, 'binary'));
//       }
//     });

//     ffmpegProcess.stdin.write(inputVideoBuffer, 'binary');
//     ffmpegProcess.stdin.end();
//   });
// }





// __________________________working code 




const fs = require('fs');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');
const { execFile } = require('child_process');

async function compressVideoBuffer(inputVideoBuffer, quality, bitrate) {
  const ffmpegCommand = [
    '-i', 'pipe:0', // Input from stdin
    '-c:v', 'libx264',
    '-b:v', `${bitrate}k`,
    '-crf', quality.toString(),
    '-f', 'mp4',
    '-movflags', 'frag_keyframe+empty_moov', // Force seekable output
    'pipe:1', // Output to stdout
  ];

  return new Promise((resolve, reject) => {
    const ffmpegProcess = execFile(ffmpegPath, ffmpegCommand, { encoding: 'binary', maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error compressing video:', stderr);
        reject(error);
      } else {
        resolve(Buffer.from(stdout, 'binary'));
      }
    });

    ffmpegProcess.stdin.write(inputVideoBuffer, 'binary');
    ffmpegProcess.stdin.end();
  });
}

exports.VideoCompressor = async (inputVideoBuffer, quality = 30, bitrate = 1000000) => {
  try {
    const compressedBuffer = await compressVideoBuffer(inputVideoBuffer, quality, bitrate);
    console.log('Video compression successful.');
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing video:', error.message);
    throw error;
  }
};


// ------------------------working 2 

// const { spawn } = require('child_process');
// const ffmpegPath = require('ffmpeg-static');

// async function compressVideoBuffer(inputVideoBuffer, quality = 30, bitrate = 1000000) {
//   const ffmpegCommand = [
//     '-i', 'pipe:0', // Input from stdin
//     '-c:v', 'libx264',
//     '-preset', 'fast', // Use the "fast" preset for faster encoding
//     '-b:v', `${bitrate}k`,
//     '-crf', quality.toString(),
//     '-f', 'mp4',
//     '-movflags', 'frag_keyframe+empty_moov', // Force seekable output
//     'pipe:1', // Output to stdout
//   ];

//   return new Promise((resolve, reject) => {
//     const ffmpegProcess = spawn(ffmpegPath, ffmpegCommand, { stdio: ['pipe', 'pipe', 'ignore'] });

//     ffmpegProcess.on('error', (error) => {
//       console.error('Error starting ffmpeg process:', error);
//       reject(error);
//     });

//     ffmpegProcess.stdout.on('data', (data) => {
//       resolve(data);
//     });

//     // Check if stderr is not null before attaching event handlers
//     if (ffmpegProcess.stderr !== null) {
//       ffmpegProcess.stderr.on('data', (data) => {
//         console.error('FFmpeg error:', data.toString());
//       });
//     }

//     ffmpegProcess.on('close', (code) => {
//       if (code !== 0) {
//         console.error('FFmpeg process exited with non-zero code:', code);
//         reject(new Error(`FFmpeg process exited with code ${code}`));
//       }
//     });

//     ffmpegProcess.stdin.write(inputVideoBuffer);
//     ffmpegProcess.stdin.end();
//   });
// }

// exports.VideoCompressor = async (inputVideoBuffer, quality = 30, bitrate = 1000000) => {
//   try {
//     const compressedBuffer = await compressVideoBuffer(inputVideoBuffer, quality, bitrate);
//     console.log('Video compression successful.');
//     return compressedBuffer;
//   } catch (error) {
//     console.error('Error compressing video:', error.message);
//     throw error;
//   }
// };





// const { spawn } = require('child_process');
// const ffmpegPath = require('ffmpeg-static');

// async function compressVideoBuffer(inputVideoBuffer, quality = 30, bitrate = 1000000) {
//   // const ffmpegCommand = [
//   //   '-i', 'pipe:0', // Input from stdin
//   //   '-c:v', 'libx264',
//   //   '-preset', 'fast', // Use the "fast" preset for faster encoding
//   //   '-b:v', `${bitrate}k`,
//   //   '-crf', quality.toString(),
//   //   '-f', 'mp4',
//   //   '-movflags', 'frag_keyframe+empty_moov', // Force seekable output
//   //   'pipe:1', // Output to stdout
//   // ];
//   const ffmpegCommand = [
//     '-i', 'pipe:0', // Input from stdin
//     '-c:v', 'libx264',
//     '-preset', 'medium', // or 'slow', 'veryslow'
//     '-b:v', `${bitrate}k`, // Adjust bitrate according to your needs
//     '-crf', '23', // Adjust CRF value
//     '-f', 'mp4',
//     '-movflags', 'frag_keyframe+empty_moov', // Force seekable output
//     'pipe:1', // Output to stdout
//   ];
  

//   return new Promise((resolve, reject) => {
//     const ffmpegProcess = spawn(ffmpegPath, ffmpegCommand, { stdio: ['pipe', 'pipe', 'ignore'] });
//     let compressedBuffer = Buffer.alloc(0);

//     ffmpegProcess.on('error', (error) => {
//       console.error('Error starting ffmpeg process:', error);
//       reject(error);
//     });

//     ffmpegProcess.stdout.on('data', (data) => {
//       compressedBuffer = Buffer.concat([compressedBuffer, data]);
//     });

//     // Check if stderr is not null before attaching event handlers
//     if (ffmpegProcess.stderr !== null) {
//       ffmpegProcess.stderr.on('data', (data) => {
//         console.error('FFmpeg error:', data.toString());
//       });
//     }

//     ffmpegProcess.on('close', (code) => {
//       if (code !== 0) {
//         console.error('FFmpeg process exited with non-zero code:', code);
//         reject(new Error(`FFmpeg process exited with code ${code}`));
//       } else {
//         resolve(compressedBuffer);
//       }
//     });

//     ffmpegProcess.stdin.write(inputVideoBuffer);
//     ffmpegProcess.stdin.end();
//   });
// }


// exports.VideoCompressor = async (inputVideoBuffer, quality = 30, bitrate = 1000000) => {
//   try {
//     const compressedBuffer = await compressVideoBuffer(inputVideoBuffer, quality, bitrate);
//     console.log('Video compression successful.');
//     return compressedBuffer;
//   } catch (error) {
//     console.error('Error compressing video:', error.message);
//     throw error;
//   }
// };






// videoCompression.js
// const fs = require('fs');
// const tmp = require('tmp');
// const { PassThrough } = require('stream');
// const ffmpeg = require('fluent-ffmpeg');

// exports.VideoCompressor = async (inputVideoBuffer, options = {}) => {
//   return new Promise((resolve, reject) => {
//     const inputStream = new PassThrough();
//     const outputBuffer = [];

//     // Write the input buffer to the input stream
//     inputStream.end(inputVideoBuffer);

//     // Perform video compression using fluent-ffmpeg with the streams
//     const command = ffmpeg()
//     .input(inputStream)
//     .videoCodec(options.videoCodec || 'libx264')
//     .audioCodec(options.audioCodec || 'aac')
//     .outputFormat('mp4')
//     .on('end', () => {
//       const compressedVideoBuffer = Buffer.concat(outputBuffer);
//       resolve(compressedVideoBuffer);
//     })
//     .on('error', (err) => {
//       console.error('Error compressing video:', err.message);
//       reject(err);
//     })
//     .on('stderr', console.error);
  
//     // Use simple buffer concatenation
//     command.pipe(outputBuffer);

//     // Run the ffmpeg command
//     command.run();
//   });
// };
