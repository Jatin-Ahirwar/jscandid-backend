const mongoose = require("mongoose")

const trailerModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    date:{
        type:String,
        require:[true,"Date is required"]
    },
    bridename:{
        type:String,
        maxlength:[15,"Bride name can not exceed 15 characters"],
        minlength:[2,"Bride name should contain minimum 2 characters"]
    },
    groomname:{
        type:String,
        maxlength:[15,"Groom name can not exceed 15 characters"],
        minlength:[2,"Groom name should contain minimum 2 characters"]
    },
    location:{
        type:String,
        maxlength:[30,"location can not exceed 15 characters"],
        minlength:[2,"location should contain minimum 2 characters"]
    },
    country:{
        type:String,
        maxlength:[20,"country can not exceed 15 characters"],
        minlength:[2,"country should contain minimum 2 characters"]
    },
    trailerposter:{
            fileId: {
                type: String,
                required: [true, "File ID is required"]
            },
            url: {
                type: String,
                required: [true, "URL is required"]
            }
    },
    trailervideo:{
        fileId: {
            type: String,
            required: [true, "File ID is required"]
        },
        url: {
            type: String,
            required: [true, "URL is required"]
        }
    },
})

const trailer = mongoose.model( "trailer" , trailerModel )

module.exports = trailer