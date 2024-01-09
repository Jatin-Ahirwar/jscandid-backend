const mongoose = require("mongoose")


const fashionModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    posterimage:String,
    images:[{
        type:String,
        required:[true, "image is required"]
    }],
    modelname:{
        unique: true,
        type:String,
        required:[true, "model name is required"],
        maxlength:[15,"model  name can not exceed 15 characters"],
        minlength:[2,"model  name should contain minimum 2 characters"]
    },
})

const fashion = mongoose.model("fashion",fashionModel)

module.exports = fashion

