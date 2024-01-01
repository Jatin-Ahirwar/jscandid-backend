const express = require("express")
const router = express.Router()
const { 
    homepage,
    adminsignup, 
    adminsignin, 
    adminsignout,
    admin
 } = require("../Controllers/indexController")
const { isAuthenticated } = require("../Middlewares/auth")

router.get("/", isAuthenticated ,homepage)

router.post("/admin", isAuthenticated ,admin)

router.post("/signup",adminsignup)

router.post("/signin",adminsignin)

router.get("/signout", isAuthenticated ,adminsignout)


module.exports = router