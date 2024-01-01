const jwt = require("jsonwebtoken")
const { catchAsyncError } = require("../Middlewares/catchAsyncError.js")
const ErrorHandler = require("../utils/ErrorHandler.js")

exports.isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const { token } = req.cookies;

    if(!token){
        return next(
            new ErrorHandler("please login to access the resource" , 401)
        )
    }
    const { id } = jwt.verify(token , process.env.JWT_SECRET)
    req.id = id
    next()
})