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
    updatekids,
    updateImages,
    deletesinglepreweddingimage,
    updatesinglepreweddingimage,
    updatesinglefashionimage,
    deletesinglefashionimage,
    deletesingleeventimage,
    updatesingleeventimage,
    updatesinglestoriesfunctionimage,
    deletesinglestoriesfunctionimage,
    composemail,
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



// -------------------------------SendMail  Opening ---------------------------------------

// Post /sendmail
router.post("/sendmail", composemail)

// ------------------------------ SendMail Closing ---------------------------------------


// ------------------------------------------ Stories Opening ---------------------------------------

// Post /createStories
router.post("/createStories", isAuthenticated , createstories)

// Post /updateStories
router.post("/updateStories/:id",isAuthenticated ,updatestories)

// Post /findallstories
router.post("/findallstories" ,findallstories)

// Post /findsinglestories
router.post("/findsinglestories/:id" ,findsinglestories)

// Post /deletesinglestories
router.post("/deletesinglestories/:id" , isAuthenticated ,deletesinglestories)

// Post /createStoriesfunction
router.post("/createStoriesfunction/:id",isAuthenticated ,createstoriesfunction)

// Post /updateStoriesfunction
router.post("/updateStoriesfunction/:id" , isAuthenticated , updatestoriesfunction)

// Post /updatesinglestoriesfunctionimage
router.post("/updatesinglestoriesfunctionimage/:id/:imageIndex" , isAuthenticated , updatesinglestoriesfunctionimage)

// Post /deletesinglestoriesfunctionimage
router.post("/deletesinglestoriesfunctionimage/:id/:imageIndex" , isAuthenticated , deletesinglestoriesfunctionimage)

// Post /deletesingleStoriesfunction
router.post("/deletesingleStoriesfunction/:storyId/:functionId" , isAuthenticated , deletesingleStoriesfunction)

// ------------------------------------------ Stories Closing ---------------------------------------


// ------------------------------------------ Images Opening ---------------------------------------

// Post /createMultipleImages
router.post("/createImages", isAuthenticated, createImages);

// Post /updateImages
router.post("/updateImages/:imageIndex", isAuthenticated, updateImages);

// Post /findallImages
router.post("/findallImages" ,findallimages)

// Post /findsingleImages
router.post("/findsingleImages/:index" ,findsingleimages)

// Post /deletesingleImages
router.post("/deletesingleImages/:imageIndex" , isAuthenticated , deletesingleimage)

// ------------------------------------------ Images Closing ---------------------------------------


// ------------------------------------------ prewedding Opening ---------------------------------------

// Post /createprewedding
router.post("/createprewedding", isAuthenticated , createprewedding)

// Post /updateprewedding
router.post("/updateprewedding/:id", isAuthenticated , updateprewedding)

// Post /updatesinglepreweddingimage
router.post("/updatesinglepreweddingimage/:id/:imageIndex" , isAuthenticated ,updatesinglepreweddingimage)

// Post /findallprewedding
router.post("/findallprewedding" ,findallprewedding)

// Post /findsingleprewedding
router.post("/findsingleprewedding/:id" ,findsingleprewedding)

// Post /deletesingleprewedding
router.post("/deletesinglepreweddingimage/:id/:imageIndex" , isAuthenticated ,deletesinglepreweddingimage)

// Post /deletesingleprewedding
router.post("/deletesingleprewedding/:id" , isAuthenticated ,deletesingleprewedding)

// ------------------------------------------ prewedding Closing ---------------------------------------


// ------------------------------------------ trailer Opening ---------------------------------------

// Post /createtrailer
router.post("/createtrailer", isAuthenticated  , createtrailer)

// Post /updatetrailer
router.post("/updatetrailer/:id", isAuthenticated ,updatetrailer)

// Post /findalltrailer
router.post("/findalltrailer" ,findalltrailer)

// Post /findsingletrailer
router.post("/findsingletrailer/:id" ,findsingletrailer)

// Post /deletesingletrailer
router.post("/deletesingletrailer/:id" , isAuthenticated ,deletesingletrailer)

// ------------------------------------------ trailer Closing ---------------------------------------


// ------------------------------------------ kids Opening ---------------------------------------

// Post /createkids
router.post("/createkids", isAuthenticated ,createkids)

// Post /updatekids
router.post("/updatekids/:imageIndex", isAuthenticated ,updatekids)

// Post /findallkids
router.post("/findallkids" ,findallkids)

// Post /findsinglekids
router.post("/findsinglekids/:index" ,findsinglekids)

// Post /deletesinglekidsimages
router.post("/deletesinglekidsimages/:imageIndex", isAuthenticated ,deletesinglekidsimages)

// ------------------------------------------ kids Closing ---------------------------------------


// ------------------------------------------ maternity Opening ---------------------------------------

// Post /createStories
router.post("/creatematernity", isAuthenticated ,creatematernity)

// Post /findallmaternity
router.post("/findallmaternity" ,findallmaternity)

// Post /findsinglematernity
router.post("/findsinglematernity/:index" ,findsinglematernity)

// Post /deletesinglematernityimages
router.post("/deletesinglematernityimages/:imageIndex", isAuthenticated , deletesinglematernityimages)

// ------------------------------------------ maternity Closing ---------------------------------------

// ------------------------------------------ fashion Opening ---------------------------------------

// Post /createfashion
router.post("/createfashion", isAuthenticated , createfashion)

// Post /updatefashion
router.post("/updatefashion/:id", isAuthenticated ,updatefashion)

// Post /updatesinglefashionimage
router.post("/updatesinglefashionimage/:id/:imageIndex", isAuthenticated , updatesinglefashionimage )

// Post /findallfashion
router.post("/findallfashion" ,findallfashion)

// Post /findsinglefashion
router.post("/findsinglefashion/:id" ,findsinglefashion)

// Post /deletesinglefashion
router.post("/deletesinglefashionimage/:id/:imageIndex" , isAuthenticated ,deletesinglefashionimage)

// Post /deletesinglefashion
router.post("/deletesinglefashion/:id" , isAuthenticated ,deletesinglefashion)

// ------------------------------------------ fashion Closing ---------------------------------------


// ------------------------------------------ event Opening ---------------------------------------

// Post /createevent
router.post("/createevent", isAuthenticated , createevent)

// Post /updateevent
router.post("/updateevent/:id", isAuthenticated , updateevent)

// Post /updatesingleeventimage
router.post("/updatesingleeventimage/:id/:imageIndex", isAuthenticated , updatesingleeventimage )

// Post /findallevent
router.post("/findallevent" ,findallevent)

// Post /findsingleevent
router.post("/findsingleevent/:id" ,findsingleevent)

// Post /deletesingleeventimage
router.post("/deletesingleeventimage/:id/:imageIndex" , isAuthenticated ,deletesingleeventimage)

// Post /deletesingleevent
router.post("/deletesingleevent/:id" , isAuthenticated ,deletesingleevent)

// ------------------------------------------ event Closing ---------------------------------------



module.exports = router