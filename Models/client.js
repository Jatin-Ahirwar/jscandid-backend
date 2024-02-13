const mongoose = require("mongoose")


const clientModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    eventdetails:{
        type:String,
        required:[true, " eventdetails name is required"],
    },
    eventtype:{
        type:String,
        required:[true, " eventtype name is required"],
    },
    dates:{
        type:String,
        required:[true,"dates is required"],
    },
    venue:{
        type:String,
        required:[true,"venue is required"],
    },
    contact:{
        type:String,
        required:[true,"contact is required"],
    },
    email:{
        type:String,
        required:[true,"email is required"],
    },
    applicantname:{
        type:String,
        required:[true,"applicantname is required"],
    },
    bridename:{
        type:String,
    },
    groomname:{
        type:String,
    },
})

const client = mongoose.model("client",clientModel)

module.exports = client

