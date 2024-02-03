const mongoose = require("mongoose")


const storiesModel = new mongoose.Schema({
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
    storiesfunction:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"storiesfunction"
    }],
    bridename:{
        type:String,
        required:[true,"couplename is required"],
        maxlength:[13,"bridename should not exceed more than 15 character"],
        minlength:[2,"bridename should have atleast 6 characters"]
    },
    groomname:{
        type:String,
        required:[true,"couplename is required"],
        maxlength:[13,"groomname should not exceed more than 15 character"],
        minlength:[2,"groomname should have atleast 6 characters"]
    },
    date:{
        type:String,
        required:[true,"date is required"],
    },
    venue:{
        type:String,
        required:[true,"venue is required"],
        maxlength:[20,"venue should not exceed more than 15 character"],
        minlength:[6,"venue should have atleast 6 characters"]
    },
    title:{
        type:String,
        required:[true,"title is required"],
        maxlength:[15,"title should not exceed more than 15 character"],
        minlength:[6,"title should have atleast 6 characters"]
    },
    location:{
        type:String,
        required:[true,"location is required"],
        maxlength:[12,"location should not exceed more than 15 character"],
        minlength:[2,"location should have atleast 6 characters"]
    },
})

const stories = mongoose.model("stories",storiesModel)

module.exports = stories

