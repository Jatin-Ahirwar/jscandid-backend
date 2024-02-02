const mongoose = require("mongoose")

const maternityModel = new mongoose.Schema({
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

const maternity = mongoose.model("maternity",maternityModel)

module.exports = maternity

