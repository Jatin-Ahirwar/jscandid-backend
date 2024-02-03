const mongoose = require("mongoose")

const maternityModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
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

},{timestamps:true})

const maternity = mongoose.model("maternity",maternityModel)

module.exports = maternity

