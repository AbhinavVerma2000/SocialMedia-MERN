const mongoose=require('mongoose')
mongoose.connect('mongodb+srv://abhinav:golu2000@cluster0.9jdlcmj.mongodb.net/SocialMedia')
const connection = mongoose.connection
connection.on('connected',()=>{
    console.log('Mongodb connection successful')
})
connection.on('error',(err)=>{
    console.log('Mongodb connection error', err)
})
// process.env.MONGO_URI