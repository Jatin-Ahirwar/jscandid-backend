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
    console.log(admin)
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
        const singlestorie = await storiesModel.findById(req.params.id).exec()
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
    const userID = await userModel.findById(req.id).exec()
    const imageIndex = req.params.imageIndex;
    const existingImages = await imagesModel.findOne({ user: userID._id });

    if (!existingImages) {
        return res.status(404).json({ message: 'Prewedding not found' });
    }

    if (imageIndex < 0 || imageIndex >= existingImages.images.length) {
        return res.status(400).json({ message: 'Invalid imageIndex' });
    }

    if (existingImages) {
        const deletedImage = existingImages.images.splice(imageIndex, 1)[0];
        // const singleImage = await imagesArray.images.splice(imageIndex,1)[0];
        await existingImages.save()
        res.status(201).json({ success: true, existingImages , deletedImage  });
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

exports.updateprewedding = catchAsyncError(async (req,res,next) =>{
    const existingprewedding = await preweddingModel.findById(req.params.id).exec()
    const { bridename , groomname , date ,country , location , } = req.body

    existingprewedding.bridename = bridename || existingprewedding.bridename
    existingprewedding.groomname = groomname || existingprewedding.groomname
    existingprewedding.date = date || existingprewedding.date
    existingprewedding.country = country || existingprewedding.country
    existingprewedding.location = location || existingprewedding.location


    if (req.files['images'] && req.files['images'].length > 0) {
        const newImages = req.files['images'].map(file => file.filename);
        existingprewedding.images = existingprewedding.images.concat(newImages);
    }

    if (req.files['posterimage'] && req.files['posterimage'].length > 0) {
        existingprewedding.posterimage = req.files['posterimage'][0].filename;
    }

    if (req.files['teaser'] && req.files['teaser'].length > 0) {
        existingprewedding.teaser = req.files['teaser'][0].filename;
    }

    await existingprewedding.save()
    res.status(201).json({success:true , existingprewedding})

})

exports.findallprewedding = catchAsyncError(async (req,res,next) =>{
        const allprewedding = await preweddingModel.find().exec()
        res.status(201).json({success:true , allprewedding })
})

exports.findsingleprewedding = catchAsyncError(async (req,res,next) =>{
        const singleimage = await preweddingModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
})

exports.deletesingleprewedding = catchAsyncError(async (req,res,next) =>{
    
    const user = await userModel.findById(req.id).exec()
    const singleprewedding = await preweddingModel.findById(req.params.id).exec()

    await preweddingModel.deleteOne({ _id: singleprewedding._id})
    const indexToRemove = user.prewedding.indexOf(singleprewedding._id);
    
    if (indexToRemove !== -1) {
        user.prewedding.splice(indexToRemove, 1);
        await user.save();
    }
    res.status(201).json({success:true , singleprewedding , user  })
    
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

exports.updatetrailer = catchAsyncError(async (req,res,next)=>{
    const existingtrailer = await trailerModel.findById(req.params.id).exec()

        const { date, bridename, groomname, location, country } = req.body;

        existingtrailer.date = date || existingtrailer.date
        existingtrailer.bridename = bridename || existingtrailer.bridename
        existingtrailer.groomname = groomname || existingtrailer.groomname
        existingtrailer.location = location || existingtrailer.location
        existingtrailer.country = country || existingtrailer.country


        if(req.files['trailerposter'] && req.files['trailerposter'].length > 0){
            existingtrailer.trailerposter = req.files['trailerposter'][0].filename; // Assuming Multer renames the file and provides the filename
        }

        if(req.files['trailervideo'] && req.files['trailervideo'].length > 0){
            existingtrailer.trailervideo = req.files['trailervideo'][0].filename;
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
        const singleimage = await trailerModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

exports.deletesingletrailer = catchAsyncError(async (req,res,next) =>{
    
    const user = await userModel.findById(req.id).exec()
    const singletrailer = await trailerModel.findById(req.params.id).exec()

    await trailerModel.deleteOne({ _id: singletrailer._id})
    const indexToRemove = user.trailer.indexOf(singletrailer._id);
    
    if (indexToRemove !== -1) {
        user.trailer.splice(indexToRemove, 1);
        await user.save();
    }
    res.status(201).json({success:true , singletrailer , user  })
    
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

exports.deletesinglekidsimages = catchAsyncError(async (req, res, next) => {
    const userID = await userModel.findById(req.id).exec()
    const imageIndex = req.params.imageIndex;
    const existingImages = await kidsModel.findOne({ user: userID._id });

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
        const singleimage = await fashionModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
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
