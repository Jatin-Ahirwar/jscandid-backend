const express = require("express")
const router = express.Router()
const { 
    homepage,
    adminsignup, 
    adminsignin, 
    adminsignout
 } = require("../Controllers/indexController")

router.get("/",homepage)

router.post("/signup",adminsignup)

router.post("/signin",adminsignin)

router.get("/signout",adminsignout)


module.exports = router