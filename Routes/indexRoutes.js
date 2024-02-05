const express = require("express")
const router = express.Router()
const {
    upload,
    homepage,
    adminsignup, 
    adminsignin, 
    adminsignout,
    admin,
    createstories,
    findallstories,
    findsinglestories,
    createimages,
    findallimages,
    findsingleimages,
    createprewedding,
    findallprewedding,
    findsingleprewedding,
    createtrailer,
    findalltrailer,
    findsingletrailer,
    createkids,
    findallkids,
    findsinglekids,
    creatematernity,
    findallmaternity,
    findsinglematernity,
    createfashion,
    findallfashion,
    findsinglefashion,
    createevent,
    findallevent,
    findsingleevent,
    updatesinglefashion,
    createstoriesfunction,
    updatestoriesfunction,
    updateprewedding,
    updatestories,
    updatetrailer,
    updatefashion,
    updateevent,
    deletesinglekidsimages,
    deletesinglematernityimages,
    deletesinglefashion,
    deletesingleevent,
    deletesingletrailer,
    deletesingleprewedding,
    deletesinglestories,
    deletesingleStoriesfunction,
    createImages,
    deletesingleimage,
 } = require("../Controllers/indexController")
const { isAuthenticated } = require("../Middlewares/auth")

// get /
router.get("/", isAuthenticated ,homepage)

// Post /admin
router.post("/admin", isAuthenticated ,admin)

// ------------------------------ Authentication & Authorization Opening ---------------------------------------

// Post /signup
router.post("/signup",adminsignup)

// Post /signin
router.post("/signin",adminsignin)

// get /signout
router.get("/signout", isAuthenticated ,adminsignout)

// ------------------------------ Authentication & Authorization Closing ---------------------------------------


// ------------------------------------------ Stories Opening ---------------------------------------

// Post /createStories
router.post("/createStories",isAuthenticated ,upload.fields([
    {name: "posterimage" , maxCount: 1},
    {name: "teaser" , maxCount: 1},
])  ,createstories)

// Post /updateStories
router.post("/updateStories/:id",isAuthenticated ,upload.fields([
    {name: "posterimage" , maxCount: 1},
    {name: "teaser" , maxCount: 1},
])  ,updatestories)

// Post /findallstories
router.post("/findallstories" ,findallstories)

// Post /findsinglestories
router.post("/findsinglestories/:id" ,findsinglestories)

// Post /deletesinglestories
router.post("/deletesinglestories/:id" , isAuthenticated ,deletesinglestories)

// Post /createStoriesfunction
router.post("/createStoriesfunction/:id",isAuthenticated ,upload.array("images")  ,createstoriesfunction)

// Post /updateStoriesfunction
router.post("/updateStoriesfunction/:id",isAuthenticated ,upload.array("images")  ,updatestoriesfunction)

// Post /deletesingleStoriesfunction
router.post("/deletesingleStoriesfunction/:id1/:id2" , isAuthenticated , deletesingleStoriesfunction)

// ------------------------------------------ Stories Closing ---------------------------------------


// ------------------------------------------ Images Opening ---------------------------------------

// Post /createMultipleImages
router.post("/createImages", isAuthenticated, createImages);

// Post /findallImages
router.post("/findallImages" ,findallimages)

// Post /findsingleImages
router.post("/findsingleImages/:index" ,findsingleimages)

// Post /deletesingleImages
router.post("/deletesingleImages/:imageIndex" , isAuthenticated , deletesingleimage)

// ------------------------------------------ Images Closing ---------------------------------------


// ------------------------------------------ prewedding Opening ---------------------------------------

// Post /createStories
router.post("/createprewedding", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"teaser" , maxCount: 1},
    {name:"images" , maxCount: 20}
])  ,createprewedding)

router.post("/updateprewedding/:id", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"teaser" , maxCount: 1},
    {name:"images" , maxCount: 20}
])  ,updateprewedding)

// Post /findallprewedding
router.post("/findallprewedding" ,findallprewedding)

// Post /findsingleprewedding
router.post("/findsingleprewedding/:id" ,findsingleprewedding)

// Post /deletesingleprewedding
router.post("/deletesingleprewedding/:id" , isAuthenticated ,deletesingleprewedding)

// ------------------------------------------ prewedding Closing ---------------------------------------


// ------------------------------------------ trailer Opening ---------------------------------------

// Post /createStories

router.post("/createtrailer", isAuthenticated  , createtrailer)


// router.post("/updatetrailer/:id", isAuthenticated , upload.fields([
//     {name:"trailerposter" , maxCount: 1} , 
//     {name:"trailervideo" , maxCount: 1}
// ])  ,updatetrailer)



router.post("/updatetrailer/:id", isAuthenticated ,updatetrailer)


// Post /findalltrailer
router.post("/findalltrailer" ,findalltrailer)

// Post /findsingletrailer
router.post("/findsingletrailer/:id" ,findsingletrailer)

// Post /deletesingletrailer
router.post("/deletesingletrailer/:id" , isAuthenticated ,deletesingletrailer)

// ------------------------------------------ trailer Closing ---------------------------------------


// ------------------------------------------ kids Opening ---------------------------------------

// Post /createStories
router.post("/createkids", isAuthenticated ,createkids)

// Post /findallkids
router.post("/findallkids" ,findallkids)

// Post /findsinglekids
router.post("/findsinglekids/:index" ,findsinglekids)

// Post /deletesinglekidsimages
router.post("/deletesinglekidsimages/:imageIndex", isAuthenticated ,deletesinglekidsimages)

// ------------------------------------------ kids Closing ---------------------------------------


// ------------------------------------------ maternity Opening ---------------------------------------

// Post /createStories
router.post("/creatematernity", isAuthenticated , upload.array("images") ,creatematernity)

// Post /findallmaternity
router.post("/findallmaternity" ,findallmaternity)

// Post /findsinglematernity
router.post("/findsinglematernity/:index" ,findsinglematernity)

// Post /deletesinglematernityimages
router.post("/deletesinglematernityimages/:imageIndex", isAuthenticated , deletesinglematernityimages)

// ------------------------------------------ maternity Closing ---------------------------------------

// ------------------------------------------ fashion Opening ---------------------------------------

// Post /createStories
router.post("/createfashion", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"images" , maxCount: 20}
]) ,createfashion)

// Post /updateStories
router.post("/updatefashion/:id", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"images" , maxCount: 20}
]) ,updatefashion)

// Post /findallfashion
router.post("/findallfashion" ,findallfashion)

// Post /findsinglefashion
router.post("/findsinglefashion/:id" ,findsinglefashion)

// Post /deletesinglefashion
router.post("/deletesinglefashion/:id" , isAuthenticated ,deletesinglefashion)

// ------------------------------------------ fashion Closing ---------------------------------------


// ------------------------------------------ event Opening ---------------------------------------

// Post /createStories
router.post("/createevent", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"images" , maxCount: 20}
])  ,createevent)

// Post /updateStories
router.post("/updateevent/:id", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"images" , maxCount: 20}
])  ,updateevent)

// Post /findallevent
router.post("/findallevent" ,findallevent)

// Post /findsingleevent
router.post("/findsingleevent/:id" ,findsingleevent)

// Post /deletesingleevent
router.post("/deletesingleevent/:id" , isAuthenticated ,deletesingleevent)
// ------------------------------------------ event Closing ---------------------------------------







module.exports = router