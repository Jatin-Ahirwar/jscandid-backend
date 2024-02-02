const mongoose = require("mongoose")


const preweddingModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    posterimage:{
        type:Object,
        default:{
            fileId:"",
            fileName:"",
            url:""
        },
        required:[true, "posterimage required"]
    },
    teaser:{
        type:Object,
        default:{
            fileId:"",
            fileName:"",
            url:""
        },
        required:[true, "teaser required"]
    },
    images:[{
        type:Object,
        default:{
            fileId:"",
            fileName:"",
            url:""
        },
        required:[true, "images required"],
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

const prewedding = mongoose.model("prewedding",preweddingModel)

module.exports = prewedding

