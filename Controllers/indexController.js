const {catchAsyncError} = require("../Middlewares/catchAsyncError.js")
const { sendtoken } = require("../utils/SendToken.js");
const userModel = require("../Models/userModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const storiesModel = require("../Models/stories.js")
const storiesFunctionModel = require("../Models/storiesfunction.js")
const imagesModel = require("../Models/images.js")
const preweddingModel = require("../Models/prewedding.js")
const trailerModel = require("../Models/trailer.js")
const kidsModel = require("../Models/kids.js")
const fashionModel = require("../Models/fashion.js")
const eventModel = require("../Models/event.js")
const maternityModel = require("../Models/maternity.js")
const clientModel = require("../Models/client.js")
const imagekit = require("../utils/imagekit.js").initImageKit()
const path = require("path");
const prewedding = require("../Models/prewedding.js");
const { sendmail } = require("../utils/nodemailer.js");
const { ImageCompressor } = require("../utils/ImageCompressor.js")
const fs = require('fs');
const { VideoCompressor } = require("../utils/VideoCompressor.js");

exports.homepage = catchAsyncError(async (req,res,next)=>{
    res.json({message:"home page"}); 
})

exports.admin = catchAsyncError(async (req,res,next)=>{
    const admin = await userModel.findById(req.id)
    .populate({
        path : 'stories',
        populate : {
          path : 'storiesfunction'
        }
    })
    .populate("images")
    .populate("prewedding")
    .populate("trailer")
    .populate("kids")
    .populate("maternity")
    .populate("fashion")
    .populate("event")
    res.json(admin)
})

// ------------------------------ Authentication & Authorization Opening ---------------------------------------

exports.adminsignup = catchAsyncError(async (req,res,next)=>{
    const user = await new userModel(req.body).save()
    sendtoken(user,201,res)
})

exports.adminsignin = catchAsyncError(async (req,res,next)=>{
    
    const user = await userModel.findOne({email : req.body.email}).select("+password").exec()
    if(!user) {
            return next (new ErrorHandler("user not exist with this email. " , 404))
    }
    const ismatch = user.comparepassword(req.body.password)
    if(!ismatch){
            return next (new ErrorHandler("wrong Credentials",500))
    }
    sendtoken(user,201,res)
})

exports.adminsignout = catchAsyncError(async (req,res,next) =>{
    res.clearCookie("token")
    res.json({message:"signout done"})
})

// ------------------------------ Authentication & Authorization Closing ---------------------------------------

// ------------------------------------------Client Opening ---------------------------------------


exports.composemail = catchAsyncError(async (req,res,next)=>{
    const userID = await userModel.findOne({email : process.env.MAIL_EMAIL_ADDRESS}).exec()
    const { eventdetails , eventtype , dates , venue , contact , email , applicantname , bridename , groomname  } = req.body
    const newClient = new clientModel({
        eventdetails, 
        eventtype, 
        dates, 
        venue, 
        contact, 
        email, 
        applicantname, 
        bridename, 
        groomname
    })

    newClient.user = newClient._id
    userID.client.push(newClient._id)
    await newClient.save()
    await userID.save()

    sendmail(req,res,next)
    res.json({ message : "mail has been succesfully sended !" , newClient}); 
})

// ------------------------------------------Client Closing ---------------------------------------

// ------------------------------------------Stories Opening ---------------------------------------

exports.createstories = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    let { date, bridename, groomname, location, venue, title } = req.body;
    let posterimage = req.files.posterimage;
    let teaser = req.files.teaser;

    
    const uploadedposterimage = [];
    const uploadedteaser = [];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4'];

    if (!Array.isArray(posterimage)) {
        posterimage = [posterimage];
    }

    for (const file of posterimage) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for posterimage. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
            const CompressedBuffer = await ImageCompressor(file.data)    
            const modifiedName = `Compressed-Story-Poster-${Date.now()}${path.extname(file.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });

        uploadedposterimage.push({ fileId, url });
    }

    if (!Array.isArray(teaser)) {
        // If it's not an array, convert it to an array
        teaser = [teaser];
    }
    for (const file of teaser) {
        if (!allowedVideoTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
            message: `File type ${file.mimetype} is not supported for teaser. Allowed video type: MP4`,
            });
        }
        
        const CompressedBuffer = await VideoCompressor(file.data)    
        const modifiedName = `Compressed-Story-Teaser-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: CompressedBuffer,
            fileName: modifiedName
        });        

        uploadedteaser.push({ fileId, url });
    }

        const newStory = new storiesModel({
            date,
            bridename,
            groomname,
            location,
            venue,
            title,
            posterimage: {
                fileId: uploadedposterimage[0].fileId,
                url: uploadedposterimage[0].url,
            },
            teaser: {
                fileId: uploadedteaser[0].fileId,
                url: uploadedteaser[0].url,
            },
            });

        newStory.user = userID._id
        userID.stories.push(newStory._id);
        await newStory.save();
        await userID.save();

        res.status(200).json({
            success: true,
            message: "Story uploaded successfully",
            Story: newStory,
        });
});

exports.updatestories = catchAsyncError(async (req,res,next)=>{
    const existingstory = await storiesModel.findById(req.params.id).exec()
    const previousstoryPosterID = existingstory.posterimage.fileId
    const previousstoryVideoID = existingstory.teaser.fileId
    let newstoryPoster = req.files?.posterimage
    let newstoryVideo = req.files?.teaser

    const { date, bridename, groomname, location, venue , title } = req.body;

        existingstory.date = date || existingstory.date
        existingstory.bridename = bridename || existingstory.bridename
        existingstory.groomname = groomname || existingstory.groomname
        existingstory.location = location || existingstory.location
        existingstory.venue = venue || existingstory.venue
        existingstory.title = title || existingstory.title

        const uploadedNewstoryPoster = [];
        const uploadedNewstoryVideo = [];
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4'];
            
        if (newstoryPoster && !Array.isArray(newstoryPoster)) {
            if (!newstoryPoster || !newstoryPoster.mimetype || !allowedImageTypes.includes(newstoryPoster.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newstoryPoster ? newstoryPoster.mimetype : 'undefined'} is not supported for posterimage. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousstoryPosterID.length > 0) {
                await imagekit.deleteFile(previousstoryPosterID);
            }
        
            // Handle the file upload for newstoryPoster
            const CompressedBuffer = await ImageCompressor(newstoryPoster.data)    
            const modifiedName = `Updated-Compressed-Story-Poster-${Date.now()}${path.extname(newstoryPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });        
    
                
            uploadedNewstoryPoster.push({ fileId , url })
        }
        
        if (newstoryVideo && !Array.isArray(newstoryVideo)) {
            if (!newstoryVideo || !newstoryVideo.mimetype || !allowedVideoTypes.includes(newstoryVideo.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newstoryVideo ? newstoryVideo.mimetype : 'undefined'} is not supported for storyvideo. Allowed video type: MP4`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousstoryVideoID.length > 0) {
                await imagekit.deleteFile(previousstoryVideoID);
            }
        
            // Handle the file upload for newstoryVideo
            const CompressedBuffer = await ImageCompressor(newstoryVideo.data)    
            const modifiedName = `Updated-Compressed-Story-Poster-${Date.now()}${path.extname(newstoryVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });        
                
            uploadedNewstoryVideo.push({ fileId , url })
        
        }

        if(uploadedNewstoryPoster.length > 0){
            existingstory.posterimage.fileId = uploadedNewstoryPoster[0].fileId || uploadedNewstoryPoster[0].fileId
            existingstory.posterimage.url = uploadedNewstoryPoster[0].url || uploadedNewstoryPoster[0].url
        }

        if(uploadedNewstoryVideo.length > 0){
            existingstory.teaser.fileId = uploadedNewstoryVideo[0].fileId || uploadedNewstoryVideo[0].fileId
            existingstory.teaser.url = uploadedNewstoryVideo[0].url || uploadedNewstoryVideo[0].url
        }

        await existingstory.save();
        res.status(201).json(existingstory);
})

exports.findallstories = catchAsyncError(async (req,res,next) =>{
    const allstories = await storiesModel.find().exec()
    res.status(201).json({success:true , allstories })
})

exports.findsinglestories = catchAsyncError(async (req,res,next) =>{
    const singlestorie = await storiesModel.findById(req.params.id).populate("storiesfunction").exec()
    res.status(201).json({success:true , singlestorie })
})

exports.deletesinglestories = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const StoryID = req.params.id;
    
    // Find the Story by ID
    const Story = await storiesModel.findById(StoryID).populate("storiesfunction").exec();
    const Storyposter = Story.posterimage ? Story.posterimage.fileId : null;
    const Storyvideo = Story.teaser ? Story.teaser.fileId : null;
    if (!Story) {
        return res.status(404).json({
            success: false,
            message: "Story not found",
        });
    }
    
    for (const functionData of Story.storiesfunction) {
        // Check if images is an array before iterating over it
        if (Array.isArray(functionData.images)) {
            for (const image of functionData.images) {
                // console.log(image.fileId);
                await imagekit.deleteFile(image.fileId);
            }
        }

        // Delete the associated storiesfunction from MongoDB
        await storiesFunctionModel.deleteOne({ _id: functionData._id });
    }

    await Promise.all([
        imagekit.deleteFile(Storyposter),
        imagekit.deleteFile(Storyvideo),
    ])

    // Update the user model to remove the Story reference
    await storiesModel.deleteOne({ _id: Story._id})
    

    const index = userID.stories.indexOf(StoryID);

    if (index !== -1) {
        userID.stories.splice(index, 1);
        await userID.save();
    }

    res.status(200).json({
        success: true,
        message: "Story deleted successfully",
    });
});

exports.createstoriesfunction = catchAsyncError(async (req, res, next) => {
    const stories = await storiesModel.findById(req.params.id).exec()
    const { functionname } = req.body;
    let files = req.files?.images;

    
    const uploadedFiles = [];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];

    if (!Array.isArray(files)) {
        files = [files];
    }

    for (const file of files) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
            const CompressedBuffer = await ImageCompressor(file.data)    
            const modifiedName = `Compressed-Story-Function-Image-${Date.now()}${path.extname(file.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });        
        
        uploadedFiles.push({ fileId, url });
    }

    const newStoryfunction = new storiesFunctionModel({
        functionname,
        images: uploadedFiles,
    });

    newStoryfunction.stories = stories._id
    stories.storiesfunction.push(newStoryfunction._id);
    await newStoryfunction.save();
    await stories.save();

    res.status(200).json({
        success: true,
        message: "Storiesfunction created successfully",
        Storiesfunction: newStoryfunction,
    });
});

exports.updatestoriesfunction = catchAsyncError(async (req,res,next)=>{
    const existingstory = await storiesFunctionModel.findById(req.params.id).exec()
    let newstoryImages = req.files?.images

    const { functionname } = req.body;

        existingstory.functionname = functionname || existingstory.functionname
        const uploadedNewstoryImages = [];
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
            
        // Handle newstoryImages if present
        if (newstoryImages) {
            const imagesArray = Array.isArray(newstoryImages) ? newstoryImages : [newstoryImages];

            for (const image of imagesArray) {
                if (!image.mimetype || !allowedImageTypes.includes(image.mimetype)) {
                    return res.status(400).json({
                        success: false,
                        message: `File type ${image ? image.mimetype : 'undefined'} is not supported for story images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                    });
                }

                const CompressedBuffer = await ImageCompressor(image.data)    
                const modifiedName = `Compressed-Story-Function-Image-${Date.now()}${path.extname(image.name)}`;
                const { fileId, url } = await imagekit.upload({
                    file: CompressedBuffer,
                    fileName: modifiedName
                });        
            

                uploadedNewstoryImages.push({ fileId, url });
            }
        }

        if(uploadedNewstoryImages.length > 0){
            existingstory.images = existingstory.images.concat(uploadedNewstoryImages)     
        }

        await existingstory.save();
        res.status(201).json(existingstory);
})

exports.updatesinglestoriesfunctionimage = catchAsyncError(async (req, res, next) => {
    const storyfunctionID = req.params.id
    const imagesEntry = await storiesFunctionModel.findById(storyfunctionID).exec();
    let files = req.files.images
    const index  = req.params.imageIndex;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];


    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }


    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const updationImage = imagesEntry.images[index].fileId;

    if(updationImage.length > 0){
        if (files && !Array.isArray(files)) {
            if (!files || !files.mimetype || !allowedImageTypes.includes(files.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${files ? files.mimetype : 'undefined'} is not supported for Images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
    
            // Delete previous file before uploading new one
            if (updationImage.length > 0) {
                await imagekit.deleteFile(updationImage);
            }
            
            // Handle the file upload for files
            const CompressedBuffer = await ImageCompressor(files.data)    
            const modifiedName = `Updated-Compressed-Story-Function-Image-${Date.now()}${path.extname(files.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });        
        
            
            imagesEntry.images[index] = { fileId , url }
            // uploadedNewImages.push({ fileId , url })
            // console.log(uploadedNewImages)
        }
    }

    // Save the changes
    await imagesEntry.save();
    res.status(200).json({
        success: true,
        message: "Image successfully updated",
        imagesEntry,
    });
});

exports.deletesinglestoriesfunctionimage = catchAsyncError(async (req, res, next) => {
    const StoriesfunctionID = req.params.id
    const imagesEntry = await storiesFunctionModel.findById(StoriesfunctionID).exec();

    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    const index  = req.params.imageIndex;

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deletedImage = imagesEntry.images[index].fileId;

    // Delete the image from ImageKit
    await imagekit.deleteFile(deletedImage);

    // Remove the image from the local database
    imagesEntry.images.splice(index, 1);

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        deletedImage
    });
});

exports.deletesingleStoriesfunction = catchAsyncError(async (req, res, next) => {
    const storiesID = req.params.storyId;
    const storiesFunctionID = req.params.functionId;
    const stories = await storiesModel.findById(storiesID).exec()
    
    // Find the storiesFunction by ID
    const storiesFunction = await storiesFunctionModel.findById(storiesFunctionID).exec();
    const storiesFunctionimages = storiesFunction.images

    if (!storiesFunction) {
        return res.status(404).json({
            success: false,
            message: "storiesFunction not found",
        });
    }

    console.log(stories,storiesFunction,storiesFunctionimages)

    if(storiesFunction){
        for (const image of storiesFunctionimages) {
            console.log(image)
            await imagekit.deleteFile(image.fileId);
        }    
    }

    // Update the user model to remove the storiesFunction reference
    await storiesFunctionModel.deleteOne({ _id: storiesFunction._id})
    
    const index = stories.storiesfunction.indexOf(storiesFunctionID);
    if (index !== -1) {
        stories.storiesfunction.splice(index, 1);
        await stories.save();
    }

    res.status(200).json({
        success: true,
        message: "storiesFunction deleted successfully",
    });
});


// ------------------------------------------ Stories Closing ---------------------------------------



// ------------------------------------------ Images Opening ---------------------------------------

exports.createImages = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec()
    let files = req.files.images;

    const uploadedFiles = [];
    const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];

    if (!Array.isArray(files)) {
        // If it's not an array, convert it to an array
        files = [files];
    }

    // Your controller file
    for (const file of files) {
        if (allowedFileTypes.includes(file.mimetype)) {
            try {
                // Compress the file before uploading
                const compressedBuffer = await ImageCompressor(file.data);
                // Upload the compressed buffer to ImageKit
                const { fileId, url } = await imagekit.upload({
                    file: compressedBuffer,
                    fileName: `compressed-Images-${Date.now()}${path.extname(file.name)}`,
                });

                uploadedFiles.push({ fileId, url, mimetype: file.mimetype });
            } catch (error) {
                console.error('Error compressing or uploading file:', error.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error compressing or uploading file',
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: `File type ${file.mimetype} is not supported. Allowed file types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
        }
    }
                
    // res.json(uploadedFiles)
    const imagesEntry = await imagesModel.findOne({ user: userID._id });

    if (!imagesEntry) {
        // If not, create a new entry
        const newImagesEntry = new imagesModel({
            images: uploadedFiles,
        });

        newImagesEntry.user = userID._id
        userID.images.push(newImagesEntry._id)
        await newImagesEntry.save();
        await userID.save()

        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            imagesEntry: newImagesEntry,
        });
    } else {

        imagesEntry.images = imagesEntry.images.concat(uploadedFiles);
        await imagesEntry.save();

        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            imagesEntry,
        });
    }
});

exports.updateImages = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const imagesEntry = await imagesModel.findOne({ user: userID._id });
    let files = req.files.images
    const index  = req.params.imageIndex;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];


    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }


    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deleteImage = imagesEntry.images[index].fileId;

    if (files && !Array.isArray(files)) {
        if (!files || !files.mimetype || !allowedImageTypes.includes(files.mimetype)) {
            return res.status(400).json({
                success: false,
                message: `File type ${files ? files.mimetype : 'undefined'} is not supported for Images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
        }

        // Delete previous file before uploading new one
        if (deleteImage.length > 0) {
            await imagekit.deleteFile(deleteImage);
        }
        
        const compressedBuffer = await ImageCompressor(files.data);
        const modifiedName = `Updated-compressed-image-${Date.now()}${path.extname(files.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: compressedBuffer,
            fileName: modifiedName,
        });
        
        imagesEntry.images[index] = { fileId , url }
        // uploadedNewImages.push({ fileId , url })
        // console.log(uploadedNewImages)
    }

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image successfully updated",
        // deletedImage,
    });
});

exports.findallimages = catchAsyncError(async (req,res,next) =>{

    const allImages = await imagesModel.find({}, 'images').exec();

    if (allImages && allImages.length > 0) {
      const imagesArray = allImages.map(userImages => userImages.images).flat();
      res.status(200).json({ success: true, images: imagesArray });
    } else {
      res.status(404).json({ error: 'No images found' });
    }
})

exports.findsingleimages = catchAsyncError(async (req, res, next) => {
    const imageIndex = req.params.index;

    const result = await imagesModel.findOne({}).exec();

    if (result && result.images && result.images.length > imageIndex) {
      const singleImage = result.images[imageIndex];
      res.status(201).json({ success: true, singleImage });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
});

exports.deletesingleimage = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const imagesEntry = await imagesModel.findOne({ user: userID._id });

    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    const index  = req.params.imageIndex;

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deletedImage = imagesEntry.images[index];

    // Delete the image from ImageKit
    try {
        await imagekit.deleteFile(deletedImage.fileId);
    } catch (error) {
        console.error("Error deleting image from ImageKit:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete image from ImageKit.",
        });
    }

    // Remove the image from the local database
    imagesEntry.images.splice(index, 1);

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        deletedImage,
    });
});

// ------------------------------------------ images Closing ---------------------------------------


// ------------------------------------------ prewedding Opening ---------------------------------------

exports.createprewedding = catchAsyncError(async (req, res, next) => {
    
    const userID = await userModel.findById(req.id).exec();
    const { bridename , groomname , date ,country , location } = req.body
    let posterimage = req.files?.posterimage;
    let teaser = req.files?.teaser;
    let files = req.files?.images;
    
    const uploadedPosterImage = [];
    const uploadedTeaser = [];
    const uploadedFiles = [];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4'];

    if (!Array.isArray(posterimage)) {
        posterimage = [posterimage];
    }

    for (const file of posterimage) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for posterimage. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            
        }
        const compressedBuffer = await ImageCompressor(file.data);
        const modifiedName = `Prewedding-compressed-poster-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: compressedBuffer,
            fileName: modifiedName,
        });
    
        uploadedPosterImage.push({ fileId, url });
    }

    if (!Array.isArray(teaser)) {
        // If it's not an array, convert it to an array
        teaser = [teaser];
    }
    for (const file of teaser) {
        if (!allowedVideoTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
            message: `File type ${file.mimetype} is not supported for teaser. Allowed video type: MP4`,
            });
        
        }

        const compressedBuffer = await VideoCompressor(file.data);
        const modifiedName = `Prewedding-compressed-teaser-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: compressedBuffer,
            fileName: modifiedName,
        });
            
        uploadedTeaser.push({ fileId, url });
    
    }

    if (!Array.isArray(files)) {
        // If it's not an array, convert it to an array
        files = [files];
    }

    for (const file of files) {
        if(allowedImageTypes.includes(file.mimetype)){

        const compressedBuffer = await ImageCompressor(file.data);
        const modifiedName = `Prewedding-compressed-images-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: compressedBuffer,
            fileName: modifiedName,
        });

        uploadedFiles.push({ fileId, url  });
    }
        else {
            return res.status(400).json({
                success: false,
                message: `File type ${file.mimetype} is not supported. Allowed file types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
        }
    }

        const newPrewedding = new preweddingModel({
            date,
            bridename,
            groomname,
            location,
            country,
            posterimage: {
                fileId: uploadedPosterImage[0].fileId,
                url: uploadedPosterImage[0].url,
            },
            teaser: {
                fileId: uploadedTeaser[0].fileId,
                url: uploadedTeaser[0].url,
            },
            images: uploadedFiles,

        });

        newPrewedding.user = userID._id
        userID.prewedding.push(newPrewedding._id);
        await newPrewedding.save();
        await userID.save();

        res.status(200).json({
            success: true,
            message: "Prewedding created successfully",
            Prewedding: newPrewedding,
        });
});

exports.updateprewedding = catchAsyncError(async (req,res,next)=>{
    const existingprewedding = await preweddingModel.findById(req.params.id).exec()
    const previousPreweddingPosterID = existingprewedding.posterimage.fileId
    const previousPreweddingVideoID = existingprewedding.teaser.fileId
    let newpreweddingPoster = req.files?.posterimage
    let newpreweddingVideo = req.files?.teaser
    let newPreweddingImages = req.files?.images

    const { date, bridename, groomname, location, country } = req.body;

        existingprewedding.date = date || existingprewedding.date
        existingprewedding.bridename = bridename || existingprewedding.bridename
        existingprewedding.groomname = groomname || existingprewedding.groomname
        existingprewedding.location = location || existingprewedding.location
        existingprewedding.country = country || existingprewedding.country

        const uploadedNewpreweddingPosterImage = [];
        const uploadedNewpreweddingTeaser = [];
        const uploadedNewPreweddingImages = [];
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4'];
            
        if (newpreweddingPoster && !Array.isArray(newpreweddingPoster)) {
            if (!newpreweddingPoster || !newpreweddingPoster.mimetype || !allowedImageTypes.includes(newpreweddingPoster.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newpreweddingPoster ? newpreweddingPoster.mimetype : 'undefined'} is not supported for preweddingposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousPreweddingPosterID.length > 0) {
                await imagekit.deleteFile(previousPreweddingPosterID);
            }
        
            // Handle the file upload for newpreweddingPoster

            const compressedBuffer = await ImageCompressor(newpreweddingPoster.data);
            const modifiedName = `Updated-Prewedding-compressed-poster-${Date.now()}${path.extname(newpreweddingPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: compressedBuffer,
                fileName: modifiedName,
            });
                
                
            uploadedNewpreweddingPosterImage.push({ fileId , url })
        }
        
        if (newpreweddingVideo && !Array.isArray(newpreweddingVideo)) {
            if (!newpreweddingVideo || !newpreweddingVideo.mimetype || !allowedVideoTypes.includes(newpreweddingVideo.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newpreweddingVideo ? newpreweddingVideo.mimetype : 'undefined'} is not supported for preweddingvideo. Allowed video type: MP4`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousPreweddingVideoID.length > 0) {
                await imagekit.deleteFile(previousPreweddingVideoID);
            }
        
            // Handle the file upload for newpreweddingVideo
            const compressedBuffer = await VideoCompressor(newpreweddingVideo.data);
            const modifiedName = `Updated-Prewedding-compressed-teaser-${Date.now()}${path.extname(newpreweddingVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: compressedBuffer,
                fileName: modifiedName,
            });

            uploadedNewpreweddingTeaser.push({ fileId , url })
        }

        // Handle newPreweddingImages if present
        if (newPreweddingImages) {
            const imagesArray = Array.isArray(newPreweddingImages) ? newPreweddingImages : [newPreweddingImages];

            for (const image of imagesArray) {
                if (!image.mimetype || !allowedImageTypes.includes(image.mimetype)) {
                    return res.status(400).json({
                        success: false,
                        message: `File type ${image ? image.mimetype : 'undefined'} is not supported for Prewedding images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                    });
                }

                const compressedBuffer = await ImageCompressor(image.data);
                const modifiedName = `Prewedding-compressed-images-${Date.now()}${path.extname(image.name)}`;
                const { fileId, url } = await imagekit.upload({
                    file: compressedBuffer,
                    fileName: modifiedName,
                });

                uploadedNewPreweddingImages.push({ fileId, url });
            }
        }



        if(uploadedNewPreweddingImages.length > 0){
            existingprewedding.images = existingprewedding.images.concat(uploadedNewPreweddingImages)     
        }

        if(uploadedNewpreweddingPosterImage.length > 0){
            existingprewedding.posterimage.fileId = uploadedNewpreweddingPosterImage[0].fileId || uploadedNewpreweddingPosterImage[0].fileId
            existingprewedding.posterimage.url = uploadedNewpreweddingPosterImage[0].fileId || uploadedNewpreweddingPosterImage[0].url
        }
        
        if(uploadedNewpreweddingTeaser.length > 0){
            existingprewedding.teaser.fileId = uploadedNewpreweddingTeaser[0].fileId || uploadedNewpreweddingTeaser[0].fileId
            existingprewedding.teaser.url = uploadedNewpreweddingTeaser[0].url || uploadedNewpreweddingTeaser[0].url
        }

        await existingprewedding.save();
        res.status(201).json(existingprewedding);
})

exports.updatesinglepreweddingimage = catchAsyncError(async (req, res, next) => {
    const PreweddingID = req.params.id
    const imagesEntry = await preweddingModel.findById(PreweddingID).exec();
    let files = req.files.images
    const index  = req.params.imageIndex;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];


    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }


    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const updationImage = imagesEntry.images[index].fileId;

    if(updationImage.length > 0){
        if (files && !Array.isArray(files)) {
            if (!files || !files.mimetype || !allowedImageTypes.includes(files.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${files ? files.mimetype : 'undefined'} is not supported for Images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
    
            // Delete previous file before uploading new one
            if (updationImage.length > 0) {
                await imagekit.deleteFile(updationImage);
            }
            
            // Handle the file upload for files
            const compressedBuffer = await ImageCompressor(files.data);
            const modifiedName = `Updated-Prewedding-compressed-image-${Date.now()}${path.extname(files.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: compressedBuffer,
                fileName: modifiedName,
            });

            imagesEntry.images[index] = { fileId , url }
            // uploadedNewImages.push({ fileId , url })
            // console.log(uploadedNewImages)
        }
    }

    // Save the changes
    await imagesEntry.save();
    res.status(200).json({
        success: true,
        message: "Image successfully updated",
        updationImage,
    });
});

exports.findallprewedding = catchAsyncError(async (req,res,next) =>{
        const allprewedding = await preweddingModel.find().exec()
        res.status(201).json({success:true , allprewedding })
})

exports.findsingleprewedding = catchAsyncError(async (req,res,next) =>{
        const singleprewedding = await preweddingModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleprewedding })
})

exports.deletesinglepreweddingimage = catchAsyncError(async (req, res, next) => {
    const PreweddingID = req.params.id
    const userID = await userModel.findById(req.id).exec();
    const imagesEntry = await preweddingModel.findById(PreweddingID).exec();

    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    const index  = req.params.imageIndex;

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deletedImage = imagesEntry.images[index].fileId;
    console.log(deletedImage)

    // Delete the image from ImageKit
    await imagekit.deleteFile(deletedImage);

    // Remove the image from the local database
    imagesEntry.images.splice(index, 1);

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        deletedImage
    });
});

exports.deletesingleprewedding = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const PreweddingID = req.params.id;
    
    // Find the Prewedding by ID
    const Prewedding = await preweddingModel.findById(PreweddingID);
    const Preweddingposterimage = Prewedding.posterimage.fileId
    const Preweddingteaser = Prewedding.teaser.fileId
    const Preweddingimages = Prewedding.images

    
    if (!Prewedding) {
        return res.status(404).json({
            success: false,
            message: "Prewedding not found",
        });
    }
    if(prewedding){
        await imagekit.deleteFile(Preweddingposterimage),
        await imagekit.deleteFile(Preweddingteaser)
        for (const image of Preweddingimages) {
            await imagekit.deleteFile(image.fileId);
        }    
    }
    // await Promise.all([
    //     imagekit.deleteFile(Preweddingposterimage),
    //     imagekit.deleteFile(Preweddingteaser)
        
    // ])

    // Update the user model to remove the Prewedding reference
    await preweddingModel.deleteOne({ _id: Prewedding._id})
    

    const index = userID.prewedding.indexOf(PreweddingID);
    if (index !== -1) {
        userID.prewedding.splice(index, 1);
        await userID.save();
    }

    res.status(200).json({
        success: true,
        message: "Prewedding deleted successfully",
    });
});

// ------------------------------------------ prewedding Closing ---------------------------------------


// ------------------------------------------ trailer Opening ---------------------------------------

exports.createtrailer = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    let { date, bridename, groomname, location, country } = req.body;
    let trailerPoster = req.files.trailerposter;
    let trailerVideo = req.files.trailervideo;
    
    const uploadedTrailerPoster = [];
    const uploadedTrailerVideo = [];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4'];

    if (!Array.isArray(trailerPoster)) {
        trailerPoster = [trailerPoster];
    }

    for (const file of trailerPoster) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
        const compressedBuffer = await ImageCompressor(file.data);
        const modifiedName = `Trailer-compressed-poster-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: compressedBuffer,
            fileName: modifiedName,
        });
    
        uploadedTrailerPoster.push({ fileId, url });
    }

    if (!Array.isArray(trailerVideo)) {
        // If it's not an array, convert it to an array
        trailerVideo = [trailerVideo];
    }
    for (const file of trailerVideo) {
        if (!allowedVideoTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
            message: `File type ${file.mimetype} is not supported for trailervideo. Allowed video type: MP4`,
        });
    }
    
        const compressedBuffer = await VideoCompressor(file.data);
        const modifiedName = `Trailer-compressed-Teaser-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: compressedBuffer,
            fileName: modifiedName,
        });
    
        uploadedTrailerVideo.push({ fileId, url });
    }

        const newTrailer = new trailerModel({
            date,
            bridename,
            groomname,
            location,
            country,
            trailerposter: {
                fileId: uploadedTrailerPoster[0].fileId,
                url: uploadedTrailerPoster[0].url,
            },
            trailervideo: {
                fileId: uploadedTrailerVideo[0].fileId,
                url: uploadedTrailerVideo[0].url,
            },
            });

        newTrailer.user = userID._id
        userID.trailer.push(newTrailer._id);
        await newTrailer.save();
        await userID.save();

        res.status(200).json({
            success: true,
            message: "Trailer uploaded successfully",
            trailer: newTrailer,
        });
});

exports.updatetrailer = catchAsyncError(async (req,res,next)=>{
    const existingtrailer = await trailerModel.findById(req.params.id).exec()
    const previousTrailerPosterID = existingtrailer.trailerposter.fileId
    const previousTrailerVideoID = existingtrailer.trailervideo.fileId
    let newTrailerPoster = req.files?.trailerposter
    let newTrailerVideo = req.files?.trailervideo

    const { date, bridename, groomname, location, country } = req.body;

        existingtrailer.date = date || existingtrailer.date
        existingtrailer.bridename = bridename || existingtrailer.bridename
        existingtrailer.groomname = groomname || existingtrailer.groomname
        existingtrailer.location = location || existingtrailer.location
        existingtrailer.country = country || existingtrailer.country

        const uploadedNewTrailerPoster = [];
        const uploadedNewTrailerVideo = [];
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4'];
            
        if (newTrailerPoster && !Array.isArray(newTrailerPoster)) {
            if (!newTrailerPoster || !newTrailerPoster.mimetype || !allowedImageTypes.includes(newTrailerPoster.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newTrailerPoster ? newTrailerPoster.mimetype : 'undefined'} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousTrailerPosterID.length > 0) {
                await imagekit.deleteFile(previousTrailerPosterID);
            }
        
            // Handle the file upload for newTrailerPoster
            const compressedBuffer = await ImageCompressor(newTrailerPoster.data);
            const modifiedName = `Updated-compressed-poster-${Date.now()}${path.extname(newTrailerPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: compressedBuffer,
                fileName: modifiedName,
            });
    
            
            uploadedNewTrailerPoster.push({ fileId , url })
        }
        
        if (newTrailerVideo && !Array.isArray(newTrailerVideo)) {
            if (!newTrailerVideo || !newTrailerVideo.mimetype || !allowedVideoTypes.includes(newTrailerVideo.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newTrailerVideo ? newTrailerVideo.mimetype : 'undefined'} is not supported for trailervideo. Allowed video type: MP4`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousTrailerVideoID.length > 0) {
                await imagekit.deleteFile(previousTrailerVideoID);
            }
        
            // Handle the file upload for newTrailerVideo
            const compressedBuffer = await ImageCompressor(newTrailerVideo.data);
            const modifiedName = `Updated-compressed-Teaser-${Date.now()}${path.extname(newTrailerVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: compressedBuffer,
                fileName: modifiedName,
            });



            uploadedNewTrailerVideo.push({ fileId , url })
        
        }

        if(uploadedNewTrailerPoster.length > 0){
            existingtrailer.trailerposter.fileId = uploadedNewTrailerPoster[0].fileId || uploadedNewTrailerPoster[0].fileId
            existingtrailer.trailerposter.url = uploadedNewTrailerPoster[0].url || uploadedNewTrailerPoster[0].url
        }

        if(uploadedNewTrailerVideo.length > 0){
            existingtrailer.trailervideo.fileId = uploadedNewTrailerVideo[0].fileId || uploadedNewTrailerVideo[0].fileId
            existingtrailer.trailervideo.url = uploadedNewTrailerVideo[0].url || uploadedNewTrailerVideo[0].url
        }

        await existingtrailer.save();
        res.status(201).json(existingtrailer);
})

exports.findalltrailer = catchAsyncError(async (req,res,next) =>{
    const alltrailers = await trailerModel.find().exec()
    res.json(alltrailers)
})

exports.findsingletrailer = catchAsyncError(async (req,res,next) =>{
    try {
        const singletrailer = await trailerModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singletrailer })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

exports.deletesingletrailer = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const trailerID = req.params.id;
    
    // Find the trailer by ID
    const trailer = await trailerModel.findById(trailerID);
    const trailerposter = trailer.trailerposter.fileId
    const trailervideo = trailer.trailervideo.fileId

    if (!trailer) {
        return res.status(404).json({
            success: false,
            message: "Trailer not found",
        });
    }

    await Promise.all([
        imagekit.deleteFile(trailerposter),
        imagekit.deleteFile(trailervideo)
    ])

    // Update the user model to remove the trailer reference
    await trailerModel.deleteOne({ _id: trailer._id})
    

    const index = userID.trailer.indexOf(trailerID);
    if (index !== -1) {
        userID.trailer.splice(index, 1);
        await userID.save();
    }

    res.status(200).json({
        success: true,
        message: "Trailer deleted successfully",
    });
});


// ------------------------------------------ trailer Closing ---------------------------------------



// ------------------------------------------ kids Opening ---------------------------------------

exports.createkids = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec()
    const imagesEntry = await kidsModel.findOne({ user: userID._id });
    let files = req.files.images;

    const uploadedFiles = [];
    const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];

    if (!Array.isArray(files)) {
        // If it's not an array, convert it to an array
        files = [files];
    }

    for (const file of files) {
        if(allowedFileTypes.includes(file.mimetype)){

        const CompressedBuffer = await ImageCompressor(file.data)    
        const modifiedName = `Compresse-Kids-Image-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: CompressedBuffer,
            fileName: modifiedName
        });

        uploadedFiles.push({ fileId, url , mimetype:file.mimetype });
        }
        else {
            return res.status(400).json({
                success: false,
                message: `File type ${file.mimetype} is not supported. Allowed file types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
        }
    }

    // res.json(uploadedFiles)

    if (!imagesEntry) {
        // If not, create a new entry
        const newImagesEntry = new kidsModel({
            images: uploadedFiles,
        });

        newImagesEntry.user = userID._id
        userID.kids.push(newImagesEntry._id)
        await newImagesEntry.save();
        await userID.save()

        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            imagesEntry: newImagesEntry,
        });
    } else {
        imagesEntry.images = imagesEntry.images.concat(uploadedFiles);
        await imagesEntry.save();

        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            imagesEntry,
        });
    }
});

exports.updatekids = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const imagesEntry = await kidsModel.findOne({ user: userID._id });
    let files = req.files.images
    const index  = req.params.imageIndex;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];


    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }


    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deleteImage = imagesEntry.images[index].fileId;

    if (files && !Array.isArray(files)) {
        if (!files || !files.mimetype || !allowedImageTypes.includes(files.mimetype)) {
            return res.status(400).json({
                success: false,
                message: `File type ${files ? files.mimetype : 'undefined'} is not supported for Images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
        }

        // Delete previous file before uploading new one
        if (deleteImage.length > 0) {
            await imagekit.deleteFile(deleteImage);
        }
        
        // Handle the file upload for files        
        const CompressedBuffer = await ImageCompressor(files.data)    
        const modifiedName = `Updated-Compresse-Kids-Image-${Date.now()}${path.extname(files.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: CompressedBuffer,
            fileName: modifiedName
        });


        imagesEntry.images[index] = { fileId , url }
        // uploadedNewImages.push({ fileId , url })
        // console.log(uploadedNewImages)

    }

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image successfully u",
        // deletedImage,
    });
});

exports.findallkids = catchAsyncError(async (req,res,next) =>{
    
    const allImages = await kidsModel.find({}, 'images').exec();

    if (allImages && allImages.length > 0) {
      const imagesArray = allImages.map(userImages => userImages.images).flat();
      res.status(200).json({ success: true, images: imagesArray });
    } else {
      res.status(404).json({ error: 'No images found' });
    }
})

exports.findsinglekids = catchAsyncError(async (req, res, next) => {
    const imageIndex = req.params.index;

    const result = await kidsModel.findOne({}).exec();

    if (result && result.images && result.images.length > imageIndex) {
      const singleImage = result.images[imageIndex];
      res.status(201).json({ success: true, singleImage });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
});

exports.deletesinglekidsimages = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const imagesEntry = await kidsModel.findOne({ user: userID._id });

    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    const index  = req.params.imageIndex;

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deletedImage = imagesEntry.images[index];

    // Delete the image from ImageKit
    try {
        await imagekit.deleteFile(deletedImage.fileId);
    } catch (error) {
        console.error("Error deleting image from ImageKit:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete image from ImageKit.",
        });
    }

    // Remove the image from the local database
    imagesEntry.images.splice(index, 1);

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        deletedImage,
    });
});

// ------------------------------------------ kids Closing ---------------------------------------



// ------------------------------------------ maternity Opening ---------------------------------------

exports.creatematernity = catchAsyncError(async (req,res,next) =>{
    const user = await userModel.findById(req.id).exec()
    
    if (!req.files || req.files.length === 0) {
        return res.status(404).json({ message: "no images found"})
    }

    const filenames = []
    req.files.forEach((file) =>{
        filenames.push(file.filename)
    })

    const existingImages = await maternityModel.findOne({ user: user._id });

    if(!existingImages) {
        const newImages =  new maternityModel({
            images:filenames
        })
        newImages.user = user._id
        user.maternity.push(newImages._id)
        await newImages.save()
        await user.save()
        res.status(200).json({success: true , newImages})
    }
    else{
        existingImages.images = existingImages.images.concat(filenames)
        await existingImages.save()
        res.status(200).json({message : true , existingImages})
    }
})

exports.findallmaternity = catchAsyncError(async (req,res,next) =>{
    const allimages = await maternityModel.find({} ,"images").exec()
    if(allimages?.length > 0 ){
        const imagesArray = allimages.map(userimages => userimages.images).flat()
        res.status(200).json({message: true , imagesArray})
    }
    res.status(404).json({message: "no images found" , })
})

exports.findsinglematernity = catchAsyncError(async (req,res,next) =>{
    const imageIndex = req.params.index;

    const result = await maternityModel.findOne({}).exec();

    if (result && result.images && result.images.length > imageIndex) {
      const singleImage = result.images[imageIndex];
      res.status(201).json({ success: true, singleImage });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
})

exports.deletesinglematernityimages = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec()
    const imageIndex = req.params.imageIndex;
    const existingImages = await maternityModel.findOne({ user: userID._id });

    if (!existingImages) {
        return res.status(404).json({ message: 'Prewedding not found' });
    }

    if (imageIndex < 0 || imageIndex >= existingImages.images.length) {
        return res.status(400).json({ message: 'Invalid imageIndex' });
    }

    if (existingImages) {
        const deletedImage = existingImages.images.splice(imageIndex, 1)[0];
        await existingImages.save()
        res.status(201).json({ success: true, existingImages , deletedImage  });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
});


// ------------------------------------------ maternity Closing ---------------------------------------



// ------------------------------------------ fashion Opening ---------------------------------------

exports.createfashion = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const { modelname , country , location } = req.body
    let posterimage = req.files?.posterimage;
    let teaser = req.files?.teaser;
    let files = req.files?.images;

    
    const uploadedPosterImage = [];
    const uploadedTeaser = [];
    const uploadedFiles = [];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4'];

    if (!Array.isArray(posterimage)) {
        posterimage = [posterimage];
    }

    for (const file of posterimage) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
            const CompressedBuffer = await ImageCompressor(file.data)    
            const modifiedName = `Compresse-Fashion-Poster-${Date.now()}${path.extname(file.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });
    
    
        uploadedPosterImage.push({ fileId, url });
    }

    if (!Array.isArray(teaser)) {
        // If it's not an array, convert it to an array
        teaser = [teaser];
    }
    for (const file of teaser) {
        if (!allowedVideoTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
            message: `File type ${file.mimetype} is not supported for trailervideo. Allowed video type: MP4`,
            });
        }
    
        const CompressedBuffer = await VideoCompressor(file.data)    
        const modifiedName = `Compressee-Fashion-Teaser-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({ 
            file: CompressedBuffer,
            fileName: modifiedName
        });

        uploadedTeaser.push({ fileId, url });
    }

    if (!Array.isArray(posterimage)) {
        posterimage = [posterimage];
    }

    for (const file of files) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }

            const CompressedBuffer = await ImageCompressor(file.data)    
            const modifiedName = `Compresse-Fashion-Teaser-${Date.now()}${path.extname(file.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });
    
        uploadedFiles.push({ fileId, url });
    }

        const newFashion = new fashionModel({
            modelname,
            location,
            country,
            posterimage: {
                fileId: uploadedPosterImage[0].fileId,
                url: uploadedPosterImage[0].url,
            },
            teaser: {
                fileId: uploadedTeaser[0].fileId,
                url: uploadedTeaser[0].url,
            },
            images: uploadedFiles,
        });

        newFashion.user = userID._id
        userID.fashion.push(newFashion._id);
        await newFashion.save();
        await userID.save();

        res.status(200).json({
            success: true,
            message: "Fashion Feed created successfully",
            Fashion: newFashion,
        });

});

exports.updatefashion = catchAsyncError(async (req,res,next)=>{
    const existingfashion = await fashionModel.findById(req.params.id).exec()
    const previousfashionPosterID = existingfashion.posterimage.fileId
    const previousfashionVideoID = existingfashion.teaser.fileId
    let newfashionPoster = req.files?.posterimage
    let newfashionVideo = req.files?.teaser
    let newFashionImages = req.files?.images

    const { modelname, location, country } = req.body;

        existingfashion.modelname = modelname || existingfashion.modelname
        existingfashion.location = location || existingfashion.location
        existingfashion.country = country || existingfashion.country

        const uploadedNewfashionPoster = [];
        const uploadedNewfashionVideo = [];
        const uploadedNewFashionImages = [];
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4'];
        
        // Handle newFashionImages if present
        if (newFashionImages) {
            const imagesArray = Array.isArray(newFashionImages) ? newFashionImages : [newFashionImages];

            for (const image of imagesArray) {
                if (!image.mimetype || !allowedImageTypes.includes(image.mimetype)) {
                    return res.status(400).json({
                        success: false,
                        message: `File type ${image ? image.mimetype : 'undefined'} is not supported for Fashion images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                    });
                }

                const CompressedBuffer = await ImageCompressor(image.data)    
                const modifiedName = `Compressed-Fashion-Image-${Date.now()}${path.extname(image.name)}`;
                const { fileId, url } = await imagekit.upload({
                    file: CompressedBuffer,
                    fileName: modifiedName
                });
        
                uploadedNewFashionImages.push({ fileId, url });
            }
        }

        // if (newfashionPoster && !Array.isArray(newfashionPoster) || newfashionPoster.length > 0 ) {
        if (newfashionPoster && !Array.isArray(newfashionPoster)) {
            if (!newfashionPoster || !newfashionPoster.mimetype || !allowedImageTypes.includes(newfashionPoster.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newfashionPoster ? newfashionPoster.mimetype : 'undefined'} is not supported for fashionposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousfashionPosterID.length > 0) {
                await imagekit.deleteFile(previousfashionPosterID);
            }
        
            // Handle the file upload for newfashionPoster
            const CompressedBuffer = await ImageCompressor(newfashionPoster.data)    
            const modifiedName = `Updatd-Compressed-Fashion-Poster-${Date.now()}${path.extname(newfashionPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });

            uploadedNewfashionPoster.push({ fileId , url })
        }
        
        if (newfashionVideo && !Array.isArray(newfashionVideo)) {
            if (!newfashionVideo || !newfashionVideo.mimetype || !allowedVideoTypes.includes(newfashionVideo.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newfashionVideo ? newfashionVideo.mimetype : 'undefined'} is not supported for fashionvideo. Allowed video type: MP4`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousfashionVideoID.length > 0) {
                await imagekit.deleteFile(previousfashionVideoID);
            }
        
            // Handle the file upload for newfashionVideo
            const CompressedBuffer = await ImageCompressor(newfashionVideo.data)    
            const modifiedName = `Updatd-Compressed-Fashion-Teaser-${Date.now()}${path.extname(newfashionVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });
            
            uploadedNewfashionVideo.push({ fileId , url })
        
        }

        if(uploadedNewFashionImages.length > 0){
            existingfashion.images = existingfashion.images.concat(uploadedNewFashionImages)
        }

        if(uploadedNewfashionPoster.length > 0){
            existingfashion.posterimage.fileId = uploadedNewfashionPoster[0].fileId || uploadedNewfashionPoster[0].fileId
            existingfashion.posterimage.url = uploadedNewfashionPoster[0].url || uploadedNewfashionPoster[0].url
        }

        if(uploadedNewfashionVideo.length > 0){
            existingfashion.teaser.fileId = uploadedNewfashionVideo[0].fileId || uploadedNewfashionVideo[0].fileId
            existingfashion.teaser.url = uploadedNewfashionVideo[0].url || uploadedNewfashionVideo[0].url
        }

        await existingfashion.save();
        res.status(201).json(existingfashion);
})

exports.updatesinglefashionimage = catchAsyncError(async (req, res, next) => {
    const FashionID = req.params.id
    const imagesEntry = await fashionModel.findById(FashionID).exec();
    let files = req.files.images
    const index  = req.params.imageIndex;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];


    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const updationImage = imagesEntry.images[index].fileId;

    if(updationImage.length > 0){
        if (files && !Array.isArray(files)) {
            if (!files || !files.mimetype || !allowedImageTypes.includes(files.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${files ? files.mimetype : 'undefined'} is not supported for Images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
    
            // Delete previous file before uploading new one
            if (updationImage.length > 0) {
                await imagekit.deleteFile(updationImage);
            }
            
            // Handle the file upload for files
            const CompressedBuffer = await ImageCompressor(files.data)    
            const modifiedName = `Updated-Compressed-Fashion-Image-${Date.now()}${path.extname(files.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });
            
            imagesEntry.images[index] = { fileId , url }
            // uploadedNewImages.push({ fileId , url })
            // console.log(uploadedNewImages)
        }
    }

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Fashion Images successfully updated",
        imagesEntry,
    });
});

exports.findallfashion = catchAsyncError(async (req,res,next) =>{
    const allfashion = await fashionModel.find().exec()
    res.status(200).json({ success : true , allfashion})
})

exports.findsinglefashion = catchAsyncError(async (req,res,next) =>{
        const singlefashion = await fashionModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singlefashion })
})

exports.deletesinglefashionimage = catchAsyncError(async (req, res, next) => {
    const FashionID = req.params.id
    const imagesEntry = await fashionModel.findById(FashionID).exec();

    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    const index  = req.params.imageIndex;

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deletedImage = imagesEntry.images[index].fileId;

    // Delete the image from ImageKit
    await imagekit.deleteFile(deletedImage);

    // Remove the image from the local database
    imagesEntry.images.splice(index, 1);

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        deletedImage
    });
});

exports.deletesinglefashion = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const fashionID = req.params.id;
    
    // Find the fashion by ID
    const fashion = await fashionModel.findById(fashionID);
    const fashionposterimage = fashion.posterimage.fileId
    const fashionteaser = fashion.teaser.fileId
    const fashionimages = fashion.images

    
    if (!fashion) {
        return res.status(404).json({
            success: false,
            message: "fashion not found",
        });
    }
    if(fashion){
        await imagekit.deleteFile(fashionposterimage),
        await imagekit.deleteFile(fashionteaser)
        for (const image of fashionimages) {
            await imagekit.deleteFile(image.fileId);
        }    
    }
    // await Promise.all([
    //     imagekit.deleteFile(fashionposterimage),
    //     imagekit.deleteFile(fashionteaser)
        
    // ])

    // Update the user model to remove the fashion reference
    await fashionModel.deleteOne({ _id: fashion._id})
    

    const index = userID.fashion.indexOf(fashionID);
    if (index !== -1) {
        userID.fashion.splice(index, 1);
        await userID.save();
    }

    res.status(200).json({
        success: true,
        message: "fashion deleted successfully",
    });
});


// ------------------------------------------ fashion Closing ---------------------------------------



// ------------------------------------------ event Opening ---------------------------------------

exports.createevent = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const { modelname , country , location } = req.body
    let posterimage = req.files?.posterimage;
    let teaser = req.files?.teaser;
    let files = req.files?.images;
    
    const uploadedPosterImage = [];
    const uploadedTeaser = [];
    const uploadedFiles = [];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4'];

    if (!Array.isArray(posterimage)) {
        posterimage = [posterimage];
    }

    for (const file of posterimage) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
            const CompressedBuffer = await ImageCompressor(file.data)    
            const modifiedName = `Compressed-Event-Poster-${Date.now()}${path.extname(file.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });
    
        uploadedPosterImage.push({ fileId, url });
    }

    if (!Array.isArray(teaser)) {
        // If it's not an array, convert it to an array
        teaser = [teaser];
    }
    for (const file of teaser) {
        if (!allowedVideoTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
            message: `File type ${file.mimetype} is not supported for trailervideo. Allowed video type: MP4`,
        });
    }
    
    const CompressedBuffer = await VideoCompressor(file.data)    
    const modifiedName = `Compressed-Event-Teaser-${Date.now()}${path.extname(file.name)}`;
    const { fileId, url } = await imagekit.upload({
        file: CompressedBuffer,
        fileName: modifiedName
    });
        uploadedTeaser.push({ fileId, url });
    }

    if (!Array.isArray(files)) {
        files = [files];
    }

    for (const file of files) {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                    message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
            const CompressedBuffer = await ImageCompressor(file.data)    
            const modifiedName = `Compressed-Event-Teaser-${Date.now()}${path.extname(file.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });    
    
            uploadedFiles.push({ fileId, url });
    }

        const newEvent = new eventModel({
            modelname,
            location,
            country,
            posterimage: {
                fileId: uploadedPosterImage[0].fileId,
                url: uploadedPosterImage[0].url,
            },
            teaser: {
                fileId: uploadedTeaser[0].fileId,
                url: uploadedTeaser[0].url,
            },
            images: uploadedFiles,
        });

        newEvent.user = userID._id
        userID.event.push(newEvent._id);
        await newEvent.save();
        await userID.save();

        res.status(200).json({
            success: true,
            message: "Event Feed created successfully",
            NEWEVENT: newEvent,
        });

});

exports.updateevent = catchAsyncError(async (req,res,next)=>{
    const existingEvent = await eventModel.findById(req.params.id).exec()
    const previousEventPosterID = existingEvent.posterimage.fileId
    const previousEventVideoID = existingEvent.teaser.fileId
    let newEventPoster = req.files?.posterimage
    let newEventVideo = req.files?.teaser
    let newEventImages = req.files?.images; 

    const { modelname, location, country } = req.body;

        existingEvent.modelname = modelname || existingEvent.modelname
        existingEvent.location = location || existingEvent.location
        existingEvent.country = country || existingEvent.country

        const uploadedNewEventPoster = [];
        const uploadedNewEventVideo = [];
        const uploadedNewEventImages = [];
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4'];
        
        // Handle newEventImages if present
        if (newEventImages) {
            const imagesArray = Array.isArray(newEventImages) ? newEventImages : [newEventImages];

            for (const image of imagesArray) {
                if (!image.mimetype || !allowedImageTypes.includes(image.mimetype)) {
                    return res.status(400).json({
                        success: false,
                        message: `File type ${image ? image.mimetype : 'undefined'} is not supported for Event images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                    });
                }

                const CompressedBuffer = await ImageCompressor(image.data)    
                const modifiedName = `Compressed-Event-Image-${Date.now()}${path.extname(image.name)}`;
                const { fileId, url } = await imagekit.upload({
                    file: CompressedBuffer,
                    fileName: modifiedName
                });

                uploadedNewEventImages.push({ fileId, url });
            }
        }



        
        // if (newEventPoster && !Array.isArray(newEventPoster) || newEventPoster.length > 0 ) {
        if (newEventPoster && !Array.isArray(newEventPoster)) {
            if (!newEventPoster || !newEventPoster.mimetype || !allowedImageTypes.includes(newEventPoster.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newEventPoster ? newEventPoster.mimetype : 'undefined'} is not supported for Eventposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousEventPosterID.length > 0) {
                await imagekit.deleteFile(previousEventPosterID);
            }
        
            // Handle the file upload for newEventPoster
            const CompressedBuffer = await ImageCompressor(newEventPoster.data)    
            const modifiedName = `Updated-Compressed-Event-Poster-${Date.now()}${path.extname(newEventPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });
            
            uploadedNewEventPoster.push({ fileId , url })
        }
        
        if (newEventVideo && !Array.isArray(newEventVideo)) {
            if (!newEventVideo || !newEventVideo.mimetype || !allowedVideoTypes.includes(newEventVideo.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${newEventVideo ? newEventVideo.mimetype : 'undefined'} is not supported for Eventvideo. Allowed video type: MP4`,
                });
            }
        
            // Delete previous file before uploading new one
            if (previousEventVideoID.length > 0) {
                await imagekit.deleteFile(previousEventVideoID);
            }
        
            // Handle the file upload for newEventVideo
            const CompressedBuffer = await ImageCompressor(newEventVideo.data)    
            const modifiedName = `Updated-Compressed-Event-Teaser-${Date.now()}${path.extname(newEventVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });

            uploadedNewEventVideo.push({ fileId , url })
        
        }

        if(uploadedNewEventImages.length > 0){
            existingEvent.images = existingEvent.images.concat(uploadedNewEventImages) 
        }

        if(uploadedNewEventPoster.length > 0){
            existingEvent.posterimage.fileId = uploadedNewEventPoster[0].fileId || uploadedNewEventPoster[0].fileId
            existingEvent.posterimage.url = uploadedNewEventPoster[0].url || uploadedNewEventPoster[0].url
        }

        if(uploadedNewEventVideo.length > 0){
            existingEvent.teaser.fileId = uploadedNewEventVideo[0].fileId || uploadedNewEventVideo[0].fileId
            existingEvent.teaser.url = uploadedNewEventVideo[0].url || uploadedNewEventVideo[0].url
        }

        await existingEvent.save();
        res.status(201).json(existingEvent);
})

exports.updatesingleeventimage = catchAsyncError(async (req, res, next) => {
    const EventID = req.params.id
    const imagesEntry = await eventModel.findById(EventID).exec();
    let files = req.files.images
    const index  = req.params.imageIndex;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];


    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }


    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const updationImage = imagesEntry.images[index].fileId;

    if(updationImage.length > 0){
        if (files && !Array.isArray(files)) {
            if (!files || !files.mimetype || !allowedImageTypes.includes(files.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${files ? files.mimetype : 'undefined'} is not supported for Images. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                });
            }
    
            // Delete previous file before uploading new one
            if (updationImage.length > 0) {
                await imagekit.deleteFile(updationImage);
            }
            
            // Handle the file upload for files
            const CompressedBuffer = await ImageCompressor(files.data)    
            const modifiedName = `Updated-Compressed-Event-Image-${Date.now()}${path.extname(files.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: CompressedBuffer,
                fileName: modifiedName
            });

            imagesEntry.images[index] = { fileId , url }
            // uploadedNewImages.push({ fileId , url })
            // console.log(uploadedNewImages)
        }
    }

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Event Images successfully updated",
        imagesEntry,
    });
});

exports.findallevent = catchAsyncError(async (req,res,next) =>{
    const allevent = await eventModel.find().exec()
    res.status(200).json({ success : true , allevent})
})

exports.findsingleevent = catchAsyncError(async (req,res,next) =>{
        const singleevent = await eventModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleevent })
})

exports.deletesingleeventimage = catchAsyncError(async (req, res, next) => {
    const eventID = req.params.id
    const imagesEntry = await eventModel.findById(eventID).exec();

    if (!imagesEntry) {
        return res.status(404).json({
            success: false,
            message: "No images found for the user.",
        });
    }

    const index  = req.params.imageIndex;

    // Check if the index is valid
    if (index < 0 || index >= imagesEntry.images.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid index provided.",
        });
    }

    const deletedImage = imagesEntry.images[index].fileId;

    // Delete the image from ImageKit
    await imagekit.deleteFile(deletedImage);

    // Remove the image from the local database
    imagesEntry.images.splice(index, 1);

    // Save the changes
    await imagesEntry.save();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        deletedImage
    });
});

exports.deletesingleevent = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec();
    const eventID = req.params.id;
    
    // Find the event by ID
    const event = await eventModel.findById(eventID);
    const eventposterimage = event.posterimage.fileId
    const eventteaser = event.teaser.fileId
    const eventimages = event.images

    
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "event not found",
        });
    }
    if(event){
        await imagekit.deleteFile(eventposterimage),
        await imagekit.deleteFile(eventteaser)
        for (const image of eventimages) {
            await imagekit.deleteFile(image.fileId);
        }    
    }

    // Update the user model to remove the event reference
    await eventModel.deleteOne({ _id: event._id})
    

    const index = userID.event.indexOf(eventID);
    if (index !== -1) {
        userID.event.splice(index, 1);
        await userID.save();
    }

    res.status(200).json({
        success: true,
        message: "event deleted successfully",
    });
});

// ------------------------------------------ event Closing ---------------------------------------
