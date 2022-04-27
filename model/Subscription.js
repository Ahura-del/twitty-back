const mongoose = require('mongoose')
const showSubscription = new mongoose.Schema({
    userId:{type:String},
    subscription:{type:Object},
  
})

module.exports = mongoose.model('Subscription' , showSubscription)