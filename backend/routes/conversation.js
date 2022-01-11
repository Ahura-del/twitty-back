const verifyToken = require('./verifyToken')
const router = require('express').Router()
const Conversation = require('../model/Conversation')
const Message = require('../model/Message')
router.post('/' , verifyToken , async (req , res)=>{

    try {
    const c = await Conversation.findOne({
        members: { $all: [req.body.reciverId,req.body.senderId] } 
    })
  
    if(c)return res.status(400).send({message:"Conversation already exist"})

    const newConversation = new Conversation({
        members:[req.body.reciverId,req.body.senderId]
    })

  
        const savedConversation = await newConversation.save()
        res.status(200).send(savedConversation)
    } catch (error) {
        res.status(500).send({message:error.message})
    }
})

router.get('/:userId' , verifyToken , async(req , res)=>{
    try {
        const conversation = await Conversation.find({
            members : { $in :[req.params.userId]}
        })
        res.status(200).json(conversation)
    } catch (error) {
        res.status(500).send({message:error.message})
    }
})

router.delete('/:userId' ,verifyToken , async(req,res)=>{
    try {
        const conversation = await Conversation.find({
            members : { $in :[req.params.userId]}
        })

const removeMessages = await Message.deleteMany({
    conversationId: conversation[0]._id
});
        const removeConversaion = await Conversation.deleteOne({
            _id:conversation[0]._id
        })

        res.status(200).send({message:'conversation deleted'})
    } catch (error) {
        res.status(500).send({message:error.message})

    }
})


module.exports = router