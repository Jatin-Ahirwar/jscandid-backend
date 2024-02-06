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
const imagekit = require("../utils/imagekit.js").initImageKit()
const multer = require("multer")
const path = require("path");
const user = require("../Models/userModel.js");
const prewedding = require("../Models/prewedding.js");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      const nd = new Date()
      const fn = nd.getTime() + Math.floor(Math.random()*1000000) + path.extname(file.originalname)
      cb(null, file.fieldname + fn)
    }
})
  
exports.upload = multer({ storage: storage })

const upload = multer({ storage: storage })
    

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
    // console.log(admin)
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



// ------------------------------------------Stories Opening ---------------------------------------

exports.createstories = catchAsyncError(async (req,res,next) =>{
    const user = await userModel.findById(req.id).exec()
    const { bridename , groomname , date , title , location , venue  } = req.body

    const posterimage = req.files && req.files['posterimage'] && req.files['posterimage'][0] && req.files['posterimage'][0].filename;
    const teaser = req.files && req.files['teaser'] && req.files['teaser'][0] && req.files['teaser'][0].filename;

    const newstories = new storiesModel({
        posterimage,
        teaser,
        bridename,
        groomname,
        date,
        title,
        location,
        venue,
    });
    
    newstories.user = user._id
    user.stories.push(newstories._id)
    await newstories.save()
    await user.save()
    res.status(201).json({success:true , newstories})
})

exports.updatestories = catchAsyncError(async (req,res,next) =>{
    const existingstories = await storiesModel.findById(req.params.id).exec()
    const { bridename , groomname , date , title , location , venue  } = req.body

    existingstories.bridename = bridename || existingstories.bridename
    existingstories.groomname = groomname || existingstories.groomname
    existingstories.date = date || existingstories.date
    existingstories.title = title || existingstories.title
    existingstories.location = location || existingstories.location
    existingstories.venue = venue || existingstories.venue

    if(req.files["posterimage"] &&  req.files["posterimage"].length > 0){
        existingstories.posterimage = req.files["posterimage"][0].filename
    }

    if(req.files["teaser"] &&  req.files["teaser"].length > 0){
        existingstories.teaser = req.files["teaser"][0].filename
    }
    
    await existingstories.save()
    res.status(201).json({success:true , existingstories})
})

exports.findallstories = catchAsyncError(async (req,res,next) =>{
        const allstories = await storiesModel.find().exec()
        res.status(201).json({success:true , allstories })
})

exports.findsinglestories = catchAsyncError(async (req,res,next) =>{
        const singlestorie = await storiesModel.findById(req.params.id).populate("storiesfunction").exec()
        res.status(201).json({success:true , singlestorie })
})

exports.deletesinglestories = catchAsyncError(async (req,res,next) =>{
    
    const user = await userModel.findById(req.id).exec()
    const singlestories = await storiesModel.findById(req.params.id).exec()

    await storiesModel.deleteOne({ _id: singlestories._id})
    const indexToRemove = user.stories.indexOf(singlestories._id);
    
    if (indexToRemove !== -1) {
        user.stories.splice(indexToRemove, 1);
        await user.save();
    }

    res.status(201).json({success:true , singlestories , user  })
    
})

exports.createstoriesfunction = catchAsyncError(async (req,res,next) =>{
    const stories = await storiesModel.findById(req.params.id).exec()
    const { functionname } = req.body

    if(!req.files || req.files.length === 0){
        return res.status(404).json({success:true , message: "files not found"})
    }

    const filenames = []
    req.files.forEach((file)=>{
        filenames.push(file.filename)
    })

    const newstoriesfunction = new storiesFunctionModel({
        functionname,
        images : filenames
    });
    
    newstoriesfunction.stories = stories._id
    stories.storiesfunction.push(newstoriesfunction._id)
    await newstoriesfunction.save()
    await stories.save()
    res.status(201).json({success:true , newstoriesfunction})
})

exports.updatestoriesfunction = catchAsyncError(async (req,res,next) =>{
    const existingfunction = await storiesFunctionModel.findById(req.params.id).exec()
    const { functionname } = req.body
    
    if (!existingfunction) {
        return res.status(404).json({ message: 'Function not found' });
    }

    const filenames = []
    req.files.forEach((file)=>{
        filenames.push(file.filename)
    })

    existingfunction.functionname = functionname;
    existingfunction.images = existingfunction.images.concat(filenames)

    await existingfunction.save()
    res.status(201).json({success:true , existingfunction})
})

exports.deletesingleStoriesfunction = catchAsyncError(async (req,res,next) =>{

    const stories = await storiesModel.findById(req.params.id1).exec()
    const storiesFunctionID = await storiesFunctionModel.findById(req.params.id2).exec()

    await storiesFunctionModel.deleteOne({ _id : storiesFunctionID._id })
    const indexToRemove = stories.storiesfunction.indexOf(storiesFunctionID._id)
    
    if (indexToRemove !== -1) {
        stories.storiesfunction.splice(indexToRemove, 1);
        await stories.save();
    }
    
    res.status(201).json({success:true , stories, storiesFunctionID  })
    
})

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

    for (const file of files) {
        if(allowedFileTypes.includes(file.mimetype)){

        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;

        const { fileId, url } = await imagekit.upload({
            file: file.data,
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
    const uploadedNewImages = [];
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
        const modifiedNamePoster = `imagekit-${Date.now()}${path.extname(files.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: files.data,
            fileName: modifiedNamePoster,
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
                    message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
            });
            }
        
        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: file.data,
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
            message: `File type ${file.mimetype} is not supported for trailervideo. Allowed video type: MP4`,
        });
    }
    
        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: file.data,
            fileName: modifiedName,
        });
        
        uploadedTeaser.push({ fileId, url });
    }

    if (!Array.isArray(files)) {
        // If it's not an array, convert it to an array
        files = [files];
    }

    for (const file of files) {
        if(!allowedImageTypes.includes(file.mimetype)){

        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;

        const { fileId, url } = await imagekit.upload({
            file: file.data,
            fileName: modifiedName
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
    let files = req.files?.images

    const { date, bridename, groomname, location, country } = req.body;

        existingprewedding.date = date || existingprewedding.date
        existingprewedding.bridename = bridename || existingprewedding.bridename
        existingprewedding.groomname = groomname || existingprewedding.groomname
        existingprewedding.location = location || existingprewedding.location
        existingprewedding.country = country || existingprewedding.country

        const uploadedNewpreweddingPosterImage = [];
        const uploadedNewpreweddingTeaser = [];
        const uploadedNewpreweddingImages = [];
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
            const modifiedNamePoster = `imagekit-${Date.now()}${path.extname(newpreweddingPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: newpreweddingPoster.data,
                fileName: modifiedNamePoster,
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
            const modifiedNameVideo = `imagekit-${Date.now()}${path.extname(newpreweddingVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: newpreweddingVideo.data,
                fileName: modifiedNameVideo,
            });
            
            uploadedNewpreweddingTeaser.push({ fileId , url })
        
        }
        if(!Array.isArray(files)){
            files = [files]
        }
        if(files.length > 0){
            for (const file of files) {
                if(allowedImageTypes.includes(file.mimetype)){
        
                const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
        
                const { fileId, url } = await imagekit.upload({
                    file: file.data,
                    fileName: modifiedName
                });
        
                uploadedNewpreweddingImages.push({ fileId , url })
                existingprewedding.images = existingprewedding.images.concat(uploadedNewpreweddingImages)
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: `File type ${file.mimetype} is not supported. Allowed file types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
                    });
                }
            }
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
    const userID = await userModel.findById(req.id).exec();
    const imagesEntry = await preweddingModel.findById(PreweddingID).exec();
    let files = req.files.images
    const index  = req.params.imageIndex;
    const uploadedNewImages = [];
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
            const modifiedNamePoster = `imagekit-${Date.now()}${path.extname(files.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: files.data,
                fileName: modifiedNamePoster,
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
        // updationImage,
    });
});



// exports.updatesinglepreweddingimage = catchAsyncError(async (req, res, next) => {
//     const PreweddingID = req.params.id
//     const userID = await userModel.findById(req.id).exec();
//     const imagesEntry = await preweddingModel.findById(PreweddingID).exec();
//     let files = req.files.images;

//     if (!imagesEntry) {
//         return res.status(404).json({
//             success: false,
//             message: "No images found for the user.",
//         });
//     }

//     const index  = req.params.imageIndex;

//     // Check if the index is valid
//     if (index < 0 || index >= imagesEntry.images.length) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid index provided.",
//         });
//     }

//     const deletedImage = imagesEntry.images[index].fileId;

//     console.log(index,deletedImage)
//     // Delete the image from ImageKit
//     if(files.length > 0) {
//         await imagekit.deleteFile(deletedImage);
//         for(const file  files)

//     }

//     // Remove the image from the local database
//     imagesEntry.images.splice(index, 1);

//     // Save the changes
//     await imagesEntry.save();

//     res.status(200).json({
//         success: true,
//         message: "Image deleted successfully",
//         deletedImage
//     });
// });

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
        
        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: file.data,
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
    
        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: file.data,
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

// exports.updatetrailer = catchAsyncError(async (req,res,next)=>{
//     const existingtrailer = await trailerModel.findById(req.params.id).exec()
//     const previousTrailerPosterID = existingtrailer.trailerposter.fileId
//     const previousTrailerVideoID = existingtrailer.trailervideo.fileId
//     let newTrailerPoster = req.files?.trailerposter
//     let newTrailerVideo = req.files?.trailervideo

//     // console.log(previousTrailerPosterID,previousTrailerVideoID)
//     console.log(newTrailerPoster,newTrailerVideo)
    
//     // const { date, bridename, groomname, location, country } = req.body;

//     //     existingtrailer.date = date || existingtrailer.date
//     //     existingtrailer.bridename = bridename || existingtrailer.bridename
//     //     existingtrailer.groomname = groomname || existingtrailer.groomname
//     //     existingtrailer.location = location || existingtrailer.location
//     //     existingtrailer.country = country || existingtrailer.country


//         // const uploadedNewTrailerPoster = [];
//         // const uploadedNewTrailerVideo = [];
//         // const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/webp'];
//         // const allowedVideoTypes = ['video/mp4'];
    
//         // if (!Array.isArray(newTrailerPoster)) {
//         //     newTrailerPoster = [newTrailerPoster];
//         // }
        
//         // if(newTrailerPoster.length > 0 ){
//         //     if(previousTrailerPosterID.length > 0){
//         //         await imagekit.deleteFile(previousTrailerPosterID)
//         //     }
            
//         //     for (const file of newTrailerPoster) {
//         //         if (!file || !file.mimetype || !allowedImageTypes.includes(file.mimetype)) {
//         //             return res.status(400).json({
//         //                 success: false,
//         //                     // message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
//         //                     message: `File type ${file.mimetype} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
//         //             });
//         //             }
                
//         //         const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
//         //         const { fileId, url } = await imagekit.upload({
//         //             file: file.data,
//         //             fileName: modifiedName,
//         //         });
            
//         //         uploadedNewTrailerPoster.push({ fileId, url });
//         //     }
//         // }

//         // if (!Array.isArray(newTrailerVideo)) {
//         //     newTrailerVideo = [newTrailerVideo];
//         // }
        
//         // if(newTrailerVideo.length > 0 ){
//         //     if(previousTrailerVideoID.length > 0){
//         //         await imagekit.deleteFile(previousTrailerVideoID)
//         //     }
            
//         //     for (const file of newTrailerVideo) {
//         //         if (!file || !file.mimetype || !allowedVideoTypes.includes(file.mimetype)) {
//         //             return res.status(400).json({
//         //                 success: false,
//         //                     // message: `File type ${file.mimetype} is not supported for trailervideo. Allowed video type: MP4`,
//         //                     message: `File type ${file.mimetype} is not supported for trailervideo. Allowed video type: MP4`,
//         //             });
//         //             }
                
//         //         const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;
//         //         const { fileId, url } = await imagekit.upload({
//         //             file: file.data,
//         //             fileName: modifiedName,
//         //         });
            
//         //         uploadedNewTrailerVideo.push({ fileId, url });
//         //     }
//         // }

//         // if(uploadedNewTrailerPoster.length > 0){
//         //     existingtrailer.trailerposter.fileId = uploadedNewTrailerPoster[0].fileId || uploadedNewTrailerPoster[0].fileId
//         //     existingtrailer.trailerposter.url = uploadedNewTrailerPoster[0].url || uploadedNewTrailerPoster[0].url
//         // }

//         // if(uploadedNewTrailerVideo.length > 0){
//         //     existingtrailer.trailervideo.fileId = uploadedNewTrailerVideo[0].fileId || uploadedNewTrailerVideo[0].fileId
//         //     existingtrailer.trailervideo.url = uploadedNewTrailerVideo[0].url || uploadedNewTrailerVideo[0].url
//         // }

//         await existingtrailer.save();
//         res.status(201).json(existingtrailer);
// })

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
            
        // if (newTrailerPoster && !Array.isArray(newTrailerPoster)) {
        //     console.log('File:', newTrailerPoster); // Add this line for debugging
        
        //     if (!newTrailerPoster || !newTrailerPoster.mimetype || !allowedImageTypes.includes(newTrailerPoster.mimetype)) {
        //         console.log('Invalid file:', newTrailerPoster); // Add this line for debugging
        
        //         return res.status(400).json({
        //             success: false,
        //             message: `File type ${newTrailerPoster ? newTrailerPoster.mimetype : 'undefined'} is not supported for trailerposter. Allowed image types: PNG, JPG, JPEG, SVG, AVIF, WebP`,
        //         });
        //     }
        // }

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
            const modifiedNamePoster = `imagekit-${Date.now()}${path.extname(newTrailerPoster.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: newTrailerPoster.data,
                fileName: modifiedNamePoster,
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
            const modifiedNameVideo = `imagekit-${Date.now()}${path.extname(newTrailerVideo.name)}`;
            const { fileId, url } = await imagekit.upload({
                file: newTrailerVideo.data,
                fileName: modifiedNameVideo,
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

        const modifiedName = `imagekit-${Date.now()}${path.extname(file.name)}`;

        const { fileId, url } = await imagekit.upload({
            file: file.data,
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
    const uploadedNewImages = [];
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
        const modifiedNamePoster = `imagekit-${Date.now()}${path.extname(files.name)}`;
        const { fileId, url } = await imagekit.upload({
            file: files.data,
            fileName: modifiedNamePoster,
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
    const user = await userModel.findById(req.id).exec()
    const { modelname , location , country } = req.body;

    const newFashion = new fashionModel({
        modelname , location , country
     });

     if (!req.files['posterimage'] || !req.files['images'] || req.files['images'].length === 0) {
         return res.status(400).json({ message: 'At least one image is required' });
     }

     newFashion.posterimage = req.files['posterimage'][0].filename
     newFashion.images = req.files['images'].map(file => file.filename)

     newFashion.user = user._id
     user.fashion.push(newFashion._id)
     await newFashion.save();
     await user.save();

     res.status(201).json(newFashion);
})

exports.updatefashion = catchAsyncError(async (req, res, next) => {
    const existingfashion = await fashionModel.findById(req.params.id).exec()
    const { modelname } = req.body;

    existingfashion.modelname = modelname || existingfashion.modelname ;
    
    if(req.files['posterimage'] && req.files['posterimage'].length > 0){
        existingfashion.posterimage = req.files['posterimage'][0].filename
    }

    if(req.files['images'] && req.files['images'].length > 0){
       const newimages = req.files['images'].map(file => file.filename)
       existingfashion.images = existingfashion.images.concat(newimages) 
    }

    await existingfashion.save();
    res.status(201).json(existingfashion);
})

exports.findallfashion = catchAsyncError(async (req,res,next) =>{
    const allfashion = await fashionModel.find().exec()
    res.status(200).json({ success : true , allfashion})
})

exports.findsinglefashion = catchAsyncError(async (req,res,next) =>{
        const singlefashion = await fashionModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singlefashion })
})

exports.deletesinglefashion = catchAsyncError(async (req,res,next) =>{
    
    const user = await userModel.findById(req.id).exec()
    const singlefashion = await fashionModel.findById(req.params.id).exec()

    await fashionModel.deleteOne({ _id: singlefashion._id})
    const indexToRemove = user.fashion.indexOf(singlefashion._id);
    
    if (indexToRemove !== -1) {
        user.fashion.splice(indexToRemove, 1);
        await user.save();
    }
    res.status(201).json({success:true , singlefashion , user  })
    
})

// ------------------------------------------ fashion Closing ---------------------------------------



// ------------------------------------------ event Opening ---------------------------------------

exports.createevent = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findById(req.id).exec()
    const { modelname  , location , country } = req.body;


    const newEvent = new eventModel({
        modelname, location , country
     });

     if (!req.files['posterimage'] || req.files['images'].length === 0) {
         return res.status(400).json({ message: 'At least one image is required' });
     }

     newEvent.posterimage = req.files['posterimage'][0].filename
     newEvent.images = req.files['images'].map(file => file.filename)

     newEvent.user = user._id
     user.event.push(newEvent._id)
     await newEvent.save();
     await user.save();

     res.status(201).json(newEvent);
})

exports.updateevent = catchAsyncError(async (req, res, next) => {
    const existingevent = await eventModel.findById(req.params.id).exec()
    const { modelname } = req.body;

    existingevent.modelname = modelname || existingevent.modelname ;
    
    if(req.files['posterimage'] && req.files['posterimage'].length > 0){
        existingevent.posterimage = req.files['posterimage'][0].filename
    }

    if (req.files['images'] && req.files['images'].length > 0) {
        const newImages = req.files['images'].map(file => file.filename);
        existingevent.images = existingevent.images.concat(newImages);
    }

    await existingevent.save();
    res.status(201).json(existingevent);
})

exports.findallevent = catchAsyncError(async (req,res,next) =>{
    const allevent = await eventModel.find().exec()
    res.status(200).json({ success : true , allevent})
})

exports.findsingleevent = catchAsyncError(async (req,res,next) =>{
        const singleevent = await eventModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleevent })
})

exports.deletesingleevent = catchAsyncError(async (req,res,next) =>{
    
    const user = await userModel.findById(req.id).exec()
    const singleevent = await eventModel.findById(req.params.id).exec()

    await eventModel.deleteOne({ _id: singleevent._id})
    const indexToRemove = user.event.indexOf(singleevent._id);
    
    if (indexToRemove !== -1) {
        user.event.splice(indexToRemove, 1);
        await user.save();
    }
    res.status(201).json({success:true , singleevent , user  })
    
})

// ------------------------------------------ event Closing ---------------------------------------
