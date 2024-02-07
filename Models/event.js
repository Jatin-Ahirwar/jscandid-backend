const mongoose = require("mongoose")


const eventModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    posterimage:{
        fileId: {
            type: String,
            required: [true, "File ID is required"]
        },
        url: {
            type: String,
            required: [true, "URL is required"]
        }
    },
    teaser:{
        fileId: {
            type: String,
            required: [true, "File ID is required"]
        },
        url: {
            type: String,
            required: [true, "URL is required"]
        }
    },
    images:[{
        fileId: {
            type: String,
            required: [true, "File ID is required"]
        },
        url: {
            type: String,
            required: [true, "URL is required"]
        }
    }],
    modelname:{
        type:String,
        required:[true, " model name is required"],
        maxlength:[15,"model name can not exceed 15 characters"],
        minlength:[2,"model name should contain minimum 2 characters"]
    },
    country:{
        type:String,
        required:[true,"country is required"],
        maxlength:[20,"country should not exceed more than 15 character"],
        minlength:[3,"country should have atleast 3 characters"]
    },
    location:{
        type:String,
        required:[true,"location is required"],
        maxlength:[12,"location should not exceed more than 15 character"],
        minlength:[2,"location should have atleast 6 characters"]
    },

})

const event = mongoose.model("event",eventModel)

module.exports = event

