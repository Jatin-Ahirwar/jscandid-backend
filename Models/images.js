const mongoose = require("mongoose")

const imagesModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    image:{
        type:String,
    },
},{timestamps:true})

const images = mongoose.model("images",imagesModel)

module.exports = images

