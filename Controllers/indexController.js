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
// const upload = multer({ storage: storage })
    


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

// exports.createimages = catchAsyncError(async (req,res,next) =>{
//     try {
//         const user = await userModel.findById(req.id).exec()
//         const images = await new imagesModel(req.body).save()
//         images.user = user._id
//         user.images.push(images._id)
//         await images.save()
//         await user.save()
//         res.status(201).json({success:true , images})
//     } catch (error) {
//         res.status(500).json(error);
//     }
// })

exports.createimages = catchAsyncError(async (req,res,next) =>{
    try {
        res.json(req.json)
    } catch (error) {
        res.status(500).json(error);
    }
})



exports.findallimages = catchAsyncError(async (req,res,next) =>{
    try {
        const allimages = await imagesModel.find().exec()
        res.status(201).json({success:true , allimages })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


exports.findsingleimages = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await imagesModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})


// ------------------------------------------ images Closing ---------------------------------------



// ------------------------------------------ prewedding Opening ---------------------------------------

exports.createprewedding = catchAsyncError(async (req,res,next) =>{
    try {
        const user = await userModel.findById(req.id).exec()
        const prewedding = await new preweddingModel(req.body).save()
        prewedding.user = user._id
        user.prewedding.push(prewedding._id)
        await prewedding.save()
        await user.save()
        res.status(201).json({success:true , prewedding})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findallprewedding = catchAsyncError(async (req,res,next) =>{
    try {
        const allprewedding = await preweddingModel.find().exec()
        res.status(201).json({success:true , allprewedding })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


exports.findsingleprewedding = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await preweddingModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})


// ------------------------------------------ prewedding Closing ---------------------------------------



// ------------------------------------------ trailer Opening ---------------------------------------

exports.createtrailer = catchAsyncError(async (req,res,next) =>{
    try {
        const user = await userModel.findById(req.id).exec()
        const trailer = await new trailerModel(req.body).save()
        trailer.user = user._id
        user.trailer.push(trailer._id)
        await trailer.save()
        await user.save()
        res.status(201).json({success:true , trailer})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findalltrailer = catchAsyncError(async (req,res,next) =>{
    try {
        const alltrailer = await trailerModel.find().exec()
        res.status(201).json({success:true , alltrailer })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

exports.createkids = catchAsyncError(async (req,res,next) =>{
    try {
        const user = await userModel.findById(req.id).exec()
        const kids = await new kidsModel(req.body).save()
        kids.user = user._id
        user.kids.push(kids._id)
        await kids.save()
        await user.save()
        res.status(201).json({success:true , kids})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findallkids = catchAsyncError(async (req,res,next) =>{
    try {
        const allkids = await kidsModel.find().exec()
        res.status(201).json({success:true , allkids })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findsinglekids = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await kidsModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

// ------------------------------------------ kids Closing ---------------------------------------



// ------------------------------------------ maternity Opening ---------------------------------------

exports.creatematernity = catchAsyncError(async (req,res,next) =>{
    try {
        const user = await userModel.findById(req.id).exec()
        const maternity = await new maternityModel(req.body).save()
        maternity.user = user._id
        user.maternity.push(maternity._id)
        await maternity.save()
        await user.save()
        res.status(201).json({success:true , maternity})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findallmaternity = catchAsyncError(async (req,res,next) =>{
    try {
        const allmaternity = await maternityModel.find().exec()
        res.status(201).json({success:true , allmaternity })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findsinglematernity = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await maternityModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

// ------------------------------------------ maternity Closing ---------------------------------------


// ------------------------------------------ fashion Opening ---------------------------------------

exports.createfashion = catchAsyncError(async (req, res, next) => {
    try {
        const user = await userModel.findById(req.id).exec()
        const fashion = await new fashionModel(req.body).save()
        fashion.user = user._id
        user.fashion.push(fashion._id)
        await fashion.save()
        await user.save()
        res.status(201).json({success:true , fashion})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findallfashion = catchAsyncError(async (req,res,next) =>{
    try {
        const allfashion = await fashionModel.find().exec()
        res.status(201).json({success:true , allfashion })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findsinglefashion = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await fashionModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

// ------------------------------------------ fashion Closing ---------------------------------------



// ------------------------------------------ event Opening ---------------------------------------

exports.createevent = catchAsyncError(async (req, res, next) => {
    try {
        const user = await userModel.findById(req.id).exec()
        const event = await new eventModel(req.body).save()
        event.user = user._id
        user.event.push(event._id)
        await event.save()
        await user.save()
        res.status(201).json({success:true , event})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findallevent = catchAsyncError(async (req,res,next) =>{
    try {
        const allevent = await eventModel.find().exec()
        res.status(201).json({success:true , allevent })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

exports.findsingleevent = catchAsyncError(async (req,res,next) =>{
    try {
        const singleimage = await eventModel.findById(req.params.id).exec()
        res.status(201).json({success:true , singleimage })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // console.log(error)
    }
})

// ------------------------------------------ event Closing ---------------------------------------
