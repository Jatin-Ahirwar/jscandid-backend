const express = require("express")
const router = express.Router()
const { 
    homepage
 } = require("../Controllers/indexController")

router.get("/",homepage)

module.exports = router