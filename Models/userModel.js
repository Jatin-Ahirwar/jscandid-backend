const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const userModel = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:[true, "Email is required"],
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password:{
        select:false,
        type:String,
        maxlength:[15,"Password should not exceed more than 15 characters"],
        minlength:[6,"Password should have atleast 6 characters"],
    },
    client:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"client"
        }
    ],
    stories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"stories"
        }
    ],
    images:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"images"
        }
    ],
    prewedding:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"prewedding"
        }
    ],
    trailer:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"trailer"
        }
    ],
    fashion:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"fashion"
        }
    ],
    event:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"event"
        }
    ],
    kids:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"kids"
        }
    ],
    maternity:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"maternity"
        }
    ],


},{timestamps:true})


userModel.pre("save", function(){
    if(!this.isModified ("password")){
        return;
    }
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password , salt)
});

userModel.methods.comparepassword = function(password){
    return bcrypt.compareSync(password, this.password)
}

userModel.methods.getjwttoken = function () {
    return  jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}

const user = mongoose.model("user", userModel)

module.exports = user

