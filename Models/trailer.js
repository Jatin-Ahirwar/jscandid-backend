const mongoose = require("mongoose")

const trailerModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    trailerposter:{
        type:String,
        required:[true,"trailerposter is required"],
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
        maxlength:[15,"location can not exceed 15 characters"],
        minlength:[2,"location should contain minimum 2 characters"]
    },
    country:{
        type:String,
        maxlength:[15,"country can not exceed 15 characters"],
        minlength:[2,"country should contain minimum 2 characters"]
    },
    trailervideo:{
        type:String,
        require:[true,"Video is required"]
    },
})

const trailer = mongoose.model( "trailer" , trailerModel )

module.exports = trailer