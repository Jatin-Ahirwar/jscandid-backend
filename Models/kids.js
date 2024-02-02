const mongoose = require("mongoose")

const kidsModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    images:[{
        type:Object,
        default:{
            fileId:"",
            fileName:"",
            url:""
        },
        required:[true, "image is required"],
    }],
},{timestamps:true})

const kids = mongoose.model("kids",kidsModel)

module.exports = kids

