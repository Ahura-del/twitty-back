
const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
const forgetPasswordCode = require("./forgetPasswordMail");
const env = require("dotenv");
const ShowUsers = require("../model/ShowUsers");
env.config();

router.get('/allUsers' , verify , async(req , res)=>{
  try {
    const users = await ShowUsers.find()
    if(!users) return res.status(400).send({message:'There is no user'})
    res.status(200).send(users)
  } catch (error) {
    res.status(400).send({message:error.message})
  }
})

router.get('/allUsers/:userId' , verify , async(req,res)=>{
  try {
    const users = await ShowUsers.findById(req.params.userId)
    if (!users) return res.status(400).send({ message: "User not exist" });
    res.status(200).json(users)
  } catch (error) {
    res.status(400).send({message:error.message})
  }
})

router.get("/:userId", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send({ message: "Email not exist" });
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/fPass/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(400).send({ message: "Email is not exist" });

    //create verify code
    const min = 1000;
    const max = 10000;
    const uniquCode = Math.floor(Math.random() * (max - min + 1) + min);

    forgetPasswordCode(user, uniquCode);
    res.status(200).send({ id: user._id, code: uniquCode });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

//verify account
router.put("/verify/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const addtoUsers = new ShowUsers({
      _id:user._id,
      name:user.name,
      bio:user.bio,
      pic:user.pic
    })

    const token = jwt.sign(
      { _id: req.params.userId },
      process.env.TOKEN_SECRET,
      {}
    );
    const updateUser = await User.updateOne(
      {
        _id: req.params.userId,
      },
      {
        $set: {
          isVerified: req.body.isVerified,
        },
      }
    );
    const seavedAddToUsers = await addtoUsers.save()
    res.status(200).send({ userId: "user updated", token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

//forget password

router.put("/fPass/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    //generate token
    const token = jwt.sign(
      { _id: req.params.userId },
      process.env.TOKEN_SECRET,
      {}
    );
    const updateUser = await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashedPass,
        },
      }
    );
    res.status(200).send({ user: "user updated", token, id: user._id });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

//update user account
router.put("/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send("User not exist");
  try {
    const updateShowUser = await ShowUsers.updateOne(
      {
        _id:user._id
      },
      {
        $set: {
          name: req.body.name,
          bio: req.body.bio,
          pic: req.body.pic,
          isOnline:req.body.isOnline
        }
      }
    )
    const updateUser = await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          name: req.body.name,
          bio: req.body.bio,
          pic: req.body.pic,
        },
      }
    );
    res.status(200).send({ message: "user Update" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

//update user password
router.put("/newPass/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send({ message: "User not found!" });
  //password is correct
  const validPass = await bcrypt.compare(req.body.oldPass, user.password);
  if (!validPass) return res.status(400).send({ message: "Invalid Passeord" });
  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.newPass, salt);
  try {
    const updateUserPass = await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashedPass,
        },
      }
    );
    res.status(200).send({ message: "password changed" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send({ message: "User not found!"});
  //password is correct
  const validPass = await bcrypt.compare(req.body.delPass, user.password);
  if (!validPass) return res.status(400).send({ message: "Invalid Passeord" });
  try {
    const removeShowUsers = await ShowUsers.deleteOne({
      _id:user._id
    })
    const removeUser = await User.deleteOne({
      _id: user._id,
    });
 
    res.status(200).send({ message: "user removed" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
