const mongoose = require("mongoose")

const kidsModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    images: [{
        fileId: {
            type: String,
            required: [true, "File ID is required"]
        },
        url: {
            type: String,
            required: [true, "URL is required"]
        }
    }],
},{timestamps:true})

const kids = mongoose.model("kids",kidsModel)

module.exports = kids

