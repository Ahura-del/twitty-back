const mongoose = require('mongoose')
const showUsersSchema = new mongoose.Schema({
    _id:{type:String},
    name:{type:String},
    bio:{type:String},
    pic:{type:String},
    isOnline:{type:Boolean , default:false}
})

module.exports = mongoose.model('ShowUsers' , showUsersSchema)