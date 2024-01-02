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
    findsingleimages
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







module.exports = router