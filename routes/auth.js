const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
const emailVerification = require("./emailVerification");
const { registerValidation, loginValidation } = require("../validation");
env.config();

//register

router.post("/register", async (req, res) => {

  //validation the data befor make user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
  //checking if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res
      .status(500)
      .send("Email already exist");

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);

  //create verify code
  const min = 1000;
  const max = 10000;
  const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);

  //create new user
  const user = new User({
    name: req.body.name,
    password: hashedPass,
    email: req.body.email,
  });

    const savedUser = await user.save();
    emailVerification(user, uniquCode);
    res.send({ id: user._id, code: uniquCode });
  } catch (error) {
    res.status(400).send(error);
  }
});

//login

router.post("/login", async (req, res) => {

  //validation the data brfore we login a user
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  //checking if the email exist
  try {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email not found!");

  //password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(401).send("Invalid Passeord");

  //create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET,{});

    if(user.isVerified){
      res.status(200).send({ id: user._id, token });
      
    }else{
        //create verify code
  const min = 1000;
  const max = 10000;
  const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);
  emailVerification(user, uniquCode);
    res.status(201).send({ id: user._id, code: uniquCode});
    }
  } catch (error) {
    res.status(400).send(error);
  }
});



module.exports = router;
