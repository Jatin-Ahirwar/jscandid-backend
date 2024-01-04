const mongoose = require("mongoose")


const storiesModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    posterimage:{
        type:String,
        required:[true,"posterimage is required"],
    },
    storiesimages:{
        storiesfunction:[{
            functionname:{
                type:String,
                required:[true,"function name is required"],
                maxlength:[13,"function name should not exceed more than 15 character"],
                minlength:[2,"function name should have atleast 6 characters"]    
            },
            functionimages:[{
                type:String,
                required:[true, "functionimages is required"],
            }]
        }]
    },
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
    Date:{
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


// const mongoose = require("mongoose")


// // const FunctionImagesSchema = new mongoose.Schema({
// //   type: String,  // You might need to adjust this based on the actual type of the image data (e.g., URL, Buffer, etc.)
// // });

// const StoriesFunctionSchema = new mongoose.Schema({
//   functionname: {
//     type: String,
//     // required: [true, "function name is required"],
//     maxlength: [13, "function name should not exceed more than 15 characters"],
//     minlength: [2, "function name should have at least 6 characters"],
//   },
//   functionimages: [{
//       type: String,  // You might need to adjust this based on the actual type of the image data (e.g., URL, Buffer, etc.)
//     // type: mongoose.Schema.Types.ObjectId,
//     // ref: "FunctionImages",
//   }],
// });


// const storiesModel = new mongoose.Schema({
//     user:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"user"
//     },
//     posterimage:String,
//     storiesimages: [{
//         storiesfunction: [{
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "StoriesFunction",
//         }],
//     }],
//     bridename:{
//         type:String,
//         required:[true,"couplename is required"],
//         maxlength:[13,"bridename should not exceed more than 15 character"],
//         minlength:[2,"bridename should have atleast 6 characters"]
//     },
//     groomname:{
//         type:String,
//         required:[true,"couplename is required"],
//         maxlength:[13,"groomname should not exceed more than 15 character"],
//         minlength:[2,"groomname should have atleast 6 characters"]
//     },
//     Date:{
//         type:String,
//         required:[true,"date is required"],
//     },
//     venue:{
//         type:String,
//         required:[true,"venue is required"],
//         maxlength:[20,"venue should not exceed more than 15 character"],
//         minlength:[6,"venue should have atleast 6 characters"]
//     },
//     title:{
//         type:String,
//         required:[true,"title is required"],
//         maxlength:[15,"title should not exceed more than 15 character"],
//         minlength:[6,"title should have atleast 6 characters"]
//     },
//     location:{
//         type:String,
//         required:[true,"location is required"],
//         maxlength:[12,"location should not exceed more than 15 character"],
//         minlength:[2,"location should have atleast 6 characters"]
//     },
// })

// // const FunctionImages = mongoose.model("FunctionImages", FunctionImagesSchema);
// const StoriesFunction = mongoose.model("StoriesFunction", StoriesFunctionSchema);
// const Stories = mongoose.model("Stories",storiesModel)

// // module.exports = {FunctionImages, StoriesFunction ,Stories}
// module.exports = { StoriesFunction ,Stories}



