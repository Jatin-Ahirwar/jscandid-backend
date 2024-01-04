const mongoose = require("mongoose")

const kidsModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    image:[{
        type:String,
        required:[true, "image is required"],
    }],
    name:[{
        type:String,
        required:[true, "name is required"],
        maxlength:[15," name can not exceed 15 characters"],
        minlength:[2," name should contain minimum 2 characters"]
    }],

},{timestamps:true})

const kids = mongoose.model("kids",kidsModel)

module.exports = kids

