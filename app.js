require("dotenv").config({path:'./.env'})
const express = require('express');
const app = express()
const cors = require("cors")
const path = require("path")

// database connection
require("./Models/database.js").connectDatabase()

app.use(cors({credentials:true,origin:true}))

// morgan setup
const logger = require("morgan")
app.use(logger("tiny"))

// bodyparser
// const bodyParser = require("body-parser")
// app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session and cookies 
const session = require("express-session")
const cookieparser = require("cookie-parser")
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:process.env.EXPRESS_SESSION_SECRET
})) 

app.use(cookieparser())

// express file-upload
const fileupload = require("express-fileupload")
app.use(fileupload())

// routes
app.use("/" , require("./Routes/indexRoutes.js"))

// error handling

const ErrorHandler = require("./utils/ErrorHandler.js")
const { generatedErrors } = require("./Middlewares/error.js");
app.all("*",(req,res,next) =>{
    next(new ErrorHandler(`Requested Url Not Found ${req.url}` , 404))
})
app.use(generatedErrors)

app.listen(
  process.env.Port,
  console.log(`server is running on port ${process.env.PORT}`)
)