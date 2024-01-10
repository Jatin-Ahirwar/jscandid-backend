const {catchAsyncError} = require("../Middlewares/catchAsyncError.js")
const { sendtoken } = require("../utils/SendToken.js");
const userModel = require("../Models/userModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const storiesModel = require("../Models/stories.js")
const imagesModel = require("../Models/images.js")
const preweddingModel = require("../Models/prewedding.js")
const trailerModel = require("../Models/trailer.js")
const kidsModel = require("../Models/kids.js")
const fashionModel = require("../Models/fashion.js")
const eventModel = require("../Models/event.js")
const maternityModel = require("../Models/maternity.js")
const multer = require("multer")
const path = require("path")



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
    res.json({message:"secure"}); 
})

exports.admin = catchAsyncError(async (req,res,next)=>{
    const admin = await userModel.findById(req.id)
    .populate("stories")
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



// ------------------------------------------Stories Opening ---------------------------------------

exports.createstories = catchAsyncError(async (req,res,next) =>{
    try {
        const user = await userModel.findById(req.id).exec()
        const stories = await new storiesModel(req.body).save()
        stories.user = user._id
        user.stories.push(stories._id)
        await stories.save()
        await user.save()
        res.status(201).json({success:true , stories})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


exports.findallstories = catchAsyncError(async (req,res,next) =>{
    try {
        const allstories = await storiesModel.find().exec()
        res.status(201).json({success:true , allstories })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


exports.findsinglestories = catchAsyncError(async (req,res,next) =>{
    try {
        const singlestorie = await storiesModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singlestorie })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ------------------------------------------ Stories Closing ---------------------------------------



// ------------------------------------------ Images Opening ---------------------------------------

exports.createimages = catchAsyncError(async (req,res,next)=>{
        const userID = await userModel.findById(req.id).exec()

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files provided" });
        }

        const filenames = [];
        req.files.forEach((file) => {
            filenames.push(file.filename);
        });

        const existingImages = await imagesModel.findOne({ user: userID._id });

        if(!existingImages){
            const newImages = new imagesModel({
                images: filenames,
            });
            newImages.user = userID._id
            userID.images.push(newImages._id)
            await newImages.save();
            await userID.save();
            res.status(201).json({ message: true , newImages });    
        }
        else{
            existingImages.images = existingImages.images.concat(filenames)    
            await existingImages.save();
            res.status(201).json({ message: true , existingImages });

        }
})

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

exports.deletesingleimages = catchAsyncError(async (req, res, next) => {
    const imageIndex = req.params.index;
    const imagesArray = await imagesModel.find().exec();

    if (imagesArray) {
      const singleImage = await imagesArray.images.splice(imageIndex,1);
      await singleImage.save()
      res.status(201).json({ success: true, imagesArray });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
});


// ------------------------------------------ images Closing ---------------------------------------


// ------------------------------------------ prewedding Opening ---------------------------------------

exports.createprewedding = catchAsyncError(async (req,res,next) =>{
        const user = await userModel.findById(req.id).exec()
        const { bridename , groomname , date ,country , location , } = req.body

        const posterimage = req.files['posterimage'][0].filename;
        const teaser = req.files['teaser'][0].filename;

        const newPrewedding = new preweddingModel({
            posterimage,
            teaser,
            bridename,
            groomname,
            date,
            country,
            location,
        });

        if (!req.files['images'] || req.files['images'].length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        newPrewedding.images = req.files['images'].map(file => file.filename); // Assuming Multer renames the files and provides the filenames
        
        newPrewedding.user = user._id
        user.prewedding.push(newPrewedding._id)
        await newPrewedding.save()
        await user.save()
        res.status(201).json({success:true , newPrewedding})
    
})

exports.findallprewedding = catchAsyncError(async (req,res,next) =>{
        const allprewedding = await preweddingModel.find().exec()
        res.status(201).json({success:true , allprewedding })
})

exports.findsingleprewedding = catchAsyncError(async (req,res,next) =>{
        const singleimage = await preweddingModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
})


// ------------------------------------------ prewedding Closing ---------------------------------------


// ------------------------------------------ trailer Opening ---------------------------------------

exports.createtrailer = catchAsyncError(async (req,res,next)=>{
    const userID = await userModel.findById(req.id).exec()

    // Assuming you're sending other data in the request body
        const { date, bridename, groomname, location, country } = req.body;

        // Create a new trailer document
        const newTrailer = new trailerModel({
            date,
            bridename,
            groomname,
            location,
            country,
        });

        // Check if trailerposter and trailervideo files are present in the request
        if (!req.files['trailerposter'] || !req.files['trailervideo']) {
            return res.status(400).json({ message: 'Both trailerposter and trailervideo are required' });
        }

        // Save file paths or data to the newTrailer document
        newTrailer.trailerposter = req.files['trailerposter'][0].filename; // Assuming Multer renames the file and provides the filename
        newTrailer.trailervideo = req.files['trailervideo'][0].filename;

        // Save the new trailer document to the database
        newTrailer.user = userID._id
        userID.trailer.push(newTrailer._id)
        const savedTrailer = await newTrailer.save();
        await userID.save()

        res.status(201).json(savedTrailer);
})

exports.findalltrailer = catchAsyncError(async (req,res,next) =>{
    const alltrailers = await trailerModel.find().exec()
    res.json(alltrailers)
})

exports.findsingletrailer = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await trailerModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

// ------------------------------------------ trailer Closing ---------------------------------------



// ------------------------------------------ kids Opening ---------------------------------------

exports.createkids = catchAsyncError(async (req,res,next)=>{
        const userID = await userModel.findById(req.id).exec()

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files provided" });
        }

        const filenames = [];
        req.files.forEach((file) => {
            filenames.push(file.filename);
        });

        const existingImages = await kidsModel.findOne({ user: userID._id });

        if(!existingImages){
            const newImages = new kidsModel({
                images: filenames,
            });
            newImages.user = userID._id
            userID.kids.push(newImages._id)
            await newImages.save();
            await userID.save();
            res.status(201).json({ message: true , newImages });    
        }
        else{
            existingImages.images = existingImages.images.concat(filenames)    
            await existingImages.save();
            res.status(201).json({ message: true , existingImages });
        }
})

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

// ------------------------------------------ maternity Closing ---------------------------------------


// ------------------------------------------ fashion Opening ---------------------------------------

exports.createfashion = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findById(req.id).exec()
    const { modelname } = req.body;


    const newFashion = new fashionModel({
        modelname,
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

exports.findallfashion = catchAsyncError(async (req,res,next) =>{
    const allfashion = await fashionModel.find().exec()
    res.status(200).json({ success : true , allfashion})
})

exports.findsinglefashion = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await fashionModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.updatesinglefashion = catchAsyncError(async (req,res,next) =>{
    const singleimage = await fashionModel.findById(req.params.id).exec()
    
    
    
    res.status(201).json({success:true , singleimage })
})

// ------------------------------------------ fashion Closing ---------------------------------------



// ------------------------------------------ event Opening ---------------------------------------

exports.createevent = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findById(req.id).exec()
    const { modelname } = req.body;


    const newEvent = new eventModel({
        modelname,
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

exports.findallevent = catchAsyncError(async (req,res,next) =>{
    const allevent = await eventModel.find().exec()
    res.status(200).json({ success : true , allevent})
})

exports.findsingleevent = catchAsyncError(async (req,res,next) =>{
    try {
        const singleevent = await eventModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleevent })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ------------------------------------------ event Closing ---------------------------------------
