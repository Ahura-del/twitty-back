const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:2,
        max:20
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    email:{
        type:String,
        unique:true,
        required:true,
    }
    ,
    bio:{
        type:String,
        default:""
    },
    pic:{
        type:String,
        default:""
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},
{timestamps:true}
)


module.exports = mongoose.model("User" , userSchema) 