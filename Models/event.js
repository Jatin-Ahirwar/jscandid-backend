const mongoose = require("mongoose")


const eventModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    posterimage:String,
    eventimages:[{
        type:String,
        required:[true, "event image is required"],
    }],
    creatername:{
        type:String,
        required:[true, "creatername is required"],
        maxlength:[15,"creater name can not exceed 15 characters"],
        minlength:[2,"creater name should contain minimum 2 characters"]
    },
})

const event = mongoose.model("event",eventModel)

module.exports = event

