const express=require("express")
require('dotenv').config()
const db=require('./db')
const port = process.env.PORT || 5000;
const cors = require('cors');
const post = require("./routes/post");
const user = require("./routes/user");
const cookieParser = require("cookie-parser");
const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use('/api/v1', post)
app.use('/api/v1', user)
app.listen(port, ()=>console.log(`Server started at ${port}`))