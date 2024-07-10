const mongoose=require('mongoose')
const postSchema= new mongoose.Schema({
    caption: String,
    image:{
        public_id: String,
        url: String,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            },
            comment: {
                type: String,
                required: true
            }
        }
    ]
});
module.exports = mongoose.model("Posts", postSchema);