const mongoose = require('mongoose')
const showUsersSchema = new mongoose.Schema({
    _id:{type:String},
    name:{type:String},
    bio:{type:String},
    pic:{type:String}
})

module.exports = mongoose.model('ShowUsers' , showUsersSchema)