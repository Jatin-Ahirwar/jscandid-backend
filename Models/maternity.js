const mongoose = require("mongoose")

const maternityModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    image:[{
        type:String,
        required:[true, "image is required"],
    }],
    ladyname:{
        type:String,
        required:[true, "lady name is required"],
        maxlength:[15,"lady name can not exceed 15 characters"],
        minlength:[2,"lady name should contain minimum 2 characters"]
    },

},{timestamps:true})

const maternity = mongoose.model("maternity",maternityModel)

module.exports = maternity

