const mongoose = require("mongoose")

const storiesfunctionModel = new mongoose.Schema({
    stories:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"stories"
    },
    functionname:{
        type:String,
        required:[true,"function name is required"],
        maxlength:[15,"function name should not exceed more than 15 character"],
        minlength:[2,"function name should have atleast 6 characters"]    
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
    }]    
})

const storiesfunction = mongoose.model("storiesfunction", storiesfunctionModel)

module.exports = storiesfunction

