const verifyToken = require("./verifyToken");
const Message = require("../model/Message");
const router = require("express").Router();

router.post("/", verifyToken, async (req, res) => {
  const newMessage = new Message(req.body);
  try {
      const savedMessage = await newMessage.save();
      const findMessage = await Message.find()
      if(findMessage.length >19){
          const count = await Message.count({} , async (err , count)=>{
              if(count > 19){
                  let doc = await Message.find().sort({_id:1}).limit(1)
                  await Message.deleteOne({_id:doc[0]._id})
                }
            }).clone()
        }
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/:conversationId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
   
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//remove history
router.delete("/:conversationId", verifyToken, async (req, res) => {
  try {
    
    const removeMessages = await Message.deleteMany({
        conversationId: req.params.conversationId,
    });
    res.status(200).send({ message: "message delete" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
