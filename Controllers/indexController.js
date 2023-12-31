const {catchAsyncError} = require("../Middlewares/catchAsyncError.js")

exports.homepage = catchAsyncError(async (req,res,next)=>{
    res.json({message:"secure"}); 
})


