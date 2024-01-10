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
    deletesingleimages,
    updatesinglefashion,
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
router.post("/createStories",isAuthenticated ,createstories)

// Post /findallstories
router.post("/findallstories" ,findallstories)

// Post /findsinglestories
router.post("/findsinglestories" ,findsinglestories)


// ------------------------------------------ Stories Closing ---------------------------------------


// ------------------------------------------ Images Opening ---------------------------------------

// Post /createMultipleImages
router.post("/createImages", isAuthenticated , upload.array("images"), createimages);

// Post /findallImages
router.post("/findallImages" ,findallimages)

// Post /findsingleImages
router.post("/findsingleImages/:index" ,findsingleimages)

// Post /deletesingleImages
router.post("/deletesingleImages/:index" , isAuthenticated , deletesingleimages)


// ------------------------------------------ Images Closing ---------------------------------------


// ------------------------------------------ prewedding Opening ---------------------------------------

// Post /createStories
router.post("/createprewedding", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"teaser" , maxCount: 1},
    {name:"images" , maxCount: 20}
])  ,createprewedding)

// Post /findallprewedding
router.post("/findallprewedding" ,findallprewedding)

// Post /findsingleprewedding
router.post("/findsingleprewedding/:id" ,findsingleprewedding)

// ------------------------------------------ prewedding Closing ---------------------------------------


// ------------------------------------------ trailer Opening ---------------------------------------

// Post /createStories

router.post("/createtrailer", isAuthenticated , upload.fields([
    {name:"trailerposter" , maxCount: 1} , 
    {name:"trailervideo" , maxCount: 1}
])  ,createtrailer)

// Post /findalltrailer
router.post("/findalltrailer" ,findalltrailer)

// Post /findsingletrailer
router.post("/findsingletrailer/:id" ,findsingletrailer)

// ------------------------------------------ trailer Closing ---------------------------------------


// ------------------------------------------ kids Opening ---------------------------------------

// Post /createStories
router.post("/createkids", isAuthenticated , upload.array("images") ,createkids)

// Post /findallkids
router.post("/findallkids" ,findallkids)

// Post /findsinglekids
router.post("/findsinglekids/:index" ,findsinglekids)

// ------------------------------------------ kids Closing ---------------------------------------


// ------------------------------------------ maternity Opening ---------------------------------------

// Post /createStories
router.post("/creatematernity", isAuthenticated , upload.array("images") ,creatematernity)

// Post /findallmaternity
router.post("/findallmaternity" ,findallmaternity)

// Post /findsinglematernity
router.post("/findsinglematernity/:index" ,findsinglematernity)

// ------------------------------------------ maternity Closing ---------------------------------------

// ------------------------------------------ fashion Opening ---------------------------------------

// Post /createStories
router.post("/createfashion", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"images" , maxCount: 20}
]) ,createfashion)

// Post /findallfashion
router.post("/findallfashion" ,findallfashion)

// Post /findsinglefashion
router.post("/findsinglefashion/:id" ,findsinglefashion)

// Post /updatesinglefashion
router.post("/updatesinglefashion/:id" ,updatesinglefashion)

// ------------------------------------------ fashion Closing ---------------------------------------


// ------------------------------------------ event Opening ---------------------------------------

// Post /createStories
router.post("/createevent", isAuthenticated, upload.fields([
    {name:"posterimage" , maxCount: 1},
    {name:"images" , maxCount: 20}
])  ,createevent)

// Post /findallevent
router.post("/findallevent" ,findallevent)

// Post /findsingleevent
router.post("/findsingleevent/:id" ,findsingleevent)

// ------------------------------------------ event Closing ---------------------------------------







module.exports = router