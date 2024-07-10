const mongoose=require('mongoose')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter your name"]
    },
    avatar:{
        public_id: String,
        url: String
    },
    email:{
        type:String,
        required: [true,"Please enter your email"],
        unique: [true, "Email already exists"]
    },
    password:{
        type: String,
        required: [true,"Please enter a password"],
        minlength: [6, "Password must be atleast 6 characters"],
        select: false
    },
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts"
        }
    ],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    resetPassToken: String,
    resetPassExpire: Date
});
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password, 10)
    }
    next()
})
userSchema.methods.matchPass=async function(password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateToken=function(){
    return jwt.sign({id: this._id},"kyascenehai")
}
userSchema.methods.getResetPassToken=function(){
    const resetToken=crypto.randomBytes(20).toString("hex")
    this.resetPassToken=crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPassExpire=Date.now()+10*60*1000
    return resetToken;
}
module.exports = mongoose.model("Users", userSchema);