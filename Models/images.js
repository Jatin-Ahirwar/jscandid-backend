const mongoose = require("mongoose")

const imagesModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    images:[{
        type:Object,
        required:[true, "image is required"],
        default:{
            fileId:"",
            url:""
        }
    }],
},{timestamps:true})

const images = mongoose.model("images",imagesModel)

module.exports = images

