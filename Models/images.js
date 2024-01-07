const mongoose = require("mongoose")

const imagesModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    images:[{
        type:String,
        required:[true, "image is required"],
    }],
},{timestamps:true})

const images = mongoose.model("images",imagesModel)

module.exports = images

