const express = require("express")
const router = express.Router()
const { 
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
    findsingleevent
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
router.post("/createStories", isAuthenticated ,createstories)

// Post /findallstories
router.get("/findallstories" ,findallstories)

// Post /findsinglestories
router.post("/findsinglestories" ,findsinglestories)

// ------------------------------------------ Stories Closing ---------------------------------------


// ------------------------------------------ Images Opening ---------------------------------------

// Post /createStories
router.post("/createImages", isAuthenticated ,createimages)

// Post /findallImages
router.get("/findallImages" ,findallimages)

// Post /findsingleImages
router.get("/findsingleImages/:id" ,findsingleimages)

// ------------------------------------------ Images Closing ---------------------------------------


// ------------------------------------------ prewedding Opening ---------------------------------------

// Post /createStories
router.post("/createprewedding", isAuthenticated ,createprewedding)

// Post /findallprewedding
router.get("/findallprewedding" ,findallprewedding)

// Post /findsingleprewedding
router.get("/findsingleprewedding/:id" ,findsingleprewedding)

// ------------------------------------------ prewedding Closing ---------------------------------------

// ------------------------------------------ trailer Opening ---------------------------------------

// Post /createStories
router.post("/createtrailer", isAuthenticated ,createtrailer)

// Post /findalltrailer
router.get("/findalltrailer" ,findalltrailer)

// Post /findsingletrailer
router.get("/findsingletrailer/:id" ,findsingletrailer)

// ------------------------------------------ trailer Closing ---------------------------------------

// ------------------------------------------ kids Opening ---------------------------------------

// Post /createStories
router.post("/createkids", isAuthenticated ,createkids)

// Post /findallkids
router.get("/findallkids" ,findallkids)

// Post /findsinglekids
router.get("/findsinglekids/:id" ,findsinglekids)

// ------------------------------------------ kids Closing ---------------------------------------



// ------------------------------------------ maternity Opening ---------------------------------------

// Post /createStories
router.post("/creatematernity", isAuthenticated ,creatematernity)

// Post /findallmaternity
router.get("/findallmaternity" ,findallmaternity)

// Post /findsinglematernity
router.get("/findsinglematernity/:id" ,findsinglematernity)

// ------------------------------------------ maternity Closing ---------------------------------------

// ------------------------------------------ fashion Opening ---------------------------------------

// Post /createStories
router.post("/createfashion", isAuthenticated ,createfashion)

// Post /findallfashion
router.get("/findallfashion" ,findallfashion)

// Post /findsinglefashion
router.get("/findsinglefashion/:id" ,findsinglefashion)

// ------------------------------------------ fashion Closing ---------------------------------------


// ------------------------------------------ event Opening ---------------------------------------

// Post /createStories
router.post("/createevent", isAuthenticated ,createevent)

// Post /findallevent
router.get("/findallevent" ,findallevent)

// Post /findsingleevent
router.get("/findsingleevent/:id" ,findsingleevent)

// ------------------------------------------ event Closing ---------------------------------------







module.exports = router