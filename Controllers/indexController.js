const {catchAsyncError} = require("../Middlewares/catchAsyncError.js")
const userModel = require("../Models/userModel.js");
const { sendtoken } = require("../utils/SendToken.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const storiesModel = require("../Models/stories.js")
const imagesModel = require("../Models/images.js")

exports.homepage = catchAsyncError(async (req,res,next)=>{
    res.json({message:"secure"}); 
})

exports.admin = catchAsyncError(async (req,res,next)=>{
    const admin = await userModel.findById(req.id).populate("stories").populate("images")
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

exports.createimages = catchAsyncError(async (req,res,next) =>{
    try {
        const user = await userModel.findById(req.id).exec()
        const images = await new imagesModel(req.body).save()
        images.user = user._id
        user.images.push(images._id)
        await images.save()
        await user.save()
        res.status(201).json({success:true , images})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
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

