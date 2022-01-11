const jwt = require('jsonwebtoken')
const env = require('dotenv')
env.config()
module.exports = (req , res , next)=>{
    try {
        const authHeader = req.headers.authorization
        if(!authHeader) return res.status(401).send('Access Denided')
        const bearer = authHeader.split(' ')
        const bearerToken = bearer[1]
        const verified = jwt.verify(bearerToken , process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (error) {
        res.status(400).send('Invalid Token')
    }
}