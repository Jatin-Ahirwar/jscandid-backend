const mongoose = require("mongoose")

const imagesModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    image:{
        type:String,
        required:[true, "image is required"],
    },
},{timestamps:true})

const image = mongoose.model("image",imagesModel)

module.exports = image

