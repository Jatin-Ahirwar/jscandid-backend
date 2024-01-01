const {catchAsyncError} = require("../Middlewares/catchAsyncError.js")
const userModel = require("../Models/userModel.js");
const { sendtoken } = require("../utils/SendToken.js");
const ErrorHandler = require("../utils/ErrorHandler.js")

exports.homepage = catchAsyncError(async (req,res,next)=>{
    res.json({message:"secure"}); 
})

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
    
})


