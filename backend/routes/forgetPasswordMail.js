const nodemailer = require('nodemailer')
const env = require("dotenv")
env.config()
const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
})

const sendForgetPassword = async (user , code)=>{
    let mailOption = {
        from: "twitty@example.com",
        to: user.email,
        subject: "Twitty chat app verification code",
        html: `
                <p>Dear ${user.name}</p>
                <p>You'r reset password code is :</p>
                <h2>${code}</h2>
                <br/>
                <br/>
                <small>Twitty chat app</small>
            `,
      };
      return await transport.sendMail(mailOption);
}

module.exports = sendForgetPassword