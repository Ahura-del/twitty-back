const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server , {
    cors:{
        origin:"http://localhost:3000",
        methods: ["GET", "POST"]
    }
})
const mongoose = require('mongoose')
 const cors = require('cors')
 const webpush = require('web-push')
const env = require('dotenv')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const conversationRoute = require('./routes/conversation')
const messageRoute = require('./routes/messages')
const port = process.env.PORT || 4000
env.config()
app.use(cors())
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({extended:false}))
webpush.setVapidDetails("mailto:ahuradel@gmail.com" , process.env.PUBLIC_VPID_KEY ,process.env.PRIVATE_VPID_KEY)
mongoose.connect("mongodb://localhost:27017/twitty_db"  , ()=>{console.log('connect to db')})
app.use('/auth' , authRoute)
app.use('/user' , userRoute)
app.use('/conversation' , conversationRoute)
app.use('/messages' , messageRoute)
app.post('/notification' , (req , res)=>{
    const payload = JSON.stringify({
        title:req.body.title,
        description:req.body.description,
        openUrl : '/'
    })
    webpush.sendNotification(req.body.subscription , payload)
    .then(res => console.log(res))
    .catch(err => console.log(err.stack))

    res.status(200).json({"success":true})
})


let users = []
let conversation =[]
const addConversation = ({senderId , reciverId , conversationId})=>{
    !conversation.some(c => c.conversationId === conversationId) && conversation.push({senderId , reciverId , conversationId})
}
 const addUser = ({userId , socketId})=>{
     !users.some(user => user.userId === userId) && users.push({userId , socketId})
 }

 const removeConversation = ({conversationId})=>{
     conversation = conversation.filter(c => c.conversationId !== conversationId)
 }

 const removeUser = ({socketId}) =>{
     users = users.filter(user => user.socketId !== socketId)
 }

 const getUser = ({userId})=>users.find(user => user.userId === userId)

io.on('connection' , (socket)=>{
    console.log('user connect')
    //  take user id and socket id
    socket.broadcast.emit('onlineUsers' , users)
    socket.on('addUser' , (userId) =>{
        addUser({userId , socketId:socket.id})
        io.emit('getUsers' , users)
    })
  // send and get and remove message
  socket.on('sendMessage' , ({sender, reciverId , text,createdAt,conversationId}) =>{
   const user = getUser({userId:reciverId})
      io.to(user?.socketId).emit('getMessage' , {
          sender,
          text,
          createdAt,
          conversationId,
      })
  })
  socket.on('sendReadMsg' , ({reciverId , read})=>{
    const user = getUser({userId:reciverId})
    io.to(user.socketId).emit('getReadMsg' , {
        read
    })

  })
  socket.on('removeMessage' , ({reciverId , status}) =>{
    const user = getUser({userId:reciverId})
    io.to(user.socketId).emit('getRmvMsg' , {
        status
    })
  })
  //add and remove conversation
 socket.on('addConversation' ,({reciverId ,senderId , conversationId})=>{
  addConversation({senderId , reciverId , conversationId})
  io.emit('getConversation' , conversation)
 })

 socket.on('removeConversation' , ({conversationId}) =>{
     removeConversation({conversationId})
     io.emit('getConversation' , conversation)
 })
  //dissconnect 
    socket.on('disconnect' , ()=>{
        console.log('a user disconnect')

        removeUser({socketId:socket.id})
        io.emit('getUsers' , users)
       })
})

 server.listen(port)
