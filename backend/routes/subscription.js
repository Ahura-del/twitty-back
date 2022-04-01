const express = require('express');
const Subscription = require('../model/Subscription');
const router = express.Router()


router.get('/:userId' , async(req , res)=>{
  const id =  req.params.userId
  const isUserId = await Subscription.findOne({userId:id})
  if(!isUserId){
    return res.status(400).send('The user is not exist!')
  }
  res.status(200).send(isUserId)
})
router.post('/' ,async (req , res)=>{
    const subscription = req.body;
  
  const endpoint = subscription.subscription;
  try {
    const endpointExist = await Subscription.findOne({userId:subscription.body.id })
    if(!endpointExist){
        const sub = new Subscription({userId:subscription.body.id ,subscription:endpoint})
        const saveNoti = await sub.save()
    //   return res.status(500).send('subsecription already exist')
}else{
        const updateSub = await Subscription.updateOne({userId:subscription.body.id} , {$set:{subscription:endpoint}})
        
    }
    
    res.status(200).send('ok')
  } catch (error) {
    console.log(error)
  }                                 
})

module.exports = router;