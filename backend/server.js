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
mongoose.connect("mongodb://localhost:27017/twitty_db"  , ()=>{console.log('connect to db')})
app.use('/auth' , authRoute)
app.use('/user' , userRoute)
app.use('/conversation' , conversationRoute)
app.use('/messages' , messageRoute)



let users = []

 const addUser = ({userId , socketId})=>{
     !users.some(user => user.userId === userId) && users.push({userId , socketId})
 }

 const removeUser = ({socketId}) =>{
     users = users.filter(user => user.socketId !== socketId)
 }

 const getUser = ({userId})=>users.find(user => user.userId === userId)

io.on('connection' , (socket)=>{
    console.log('a user connect')
   //  take user id and socket id
  socket.on('addUser' , (userId) =>{
     addUser({userId , socketId:socket.id})
      io.emit('getUsers' , users)
  })
  // send and get message
  socket.on('sendMessage' , ({senderId , reciverId , text}) =>{
   const user = getUser({userId:reciverId})
      io.to(user?.socketId).emit('getMessage' , {
          senderId,
          text
      })
  })
  //dissconnect 
    socket.on('disconnect' , ()=>{
        console.log('a user disconnect')

        removeUser({socketId:socket.id})
        io.emit('getUsers' , users)
       })
})

 server.listen(port)
