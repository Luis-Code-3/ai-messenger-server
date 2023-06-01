var express = require('express');
var router = express.Router();
const Users = require('../models/Users.model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.post('/register', async (req, res) => {

  const { name, username, email, password, language } = req.body;

  if (!username || !email || !password || !name || !language) {
    return res.status(400).json({message: "All fields are required. Try Again"});
  }

  try {
    const foundUser = await Users.findOne({ $or: [{email: email}, {username: username}] });
    if(foundUser) {
      if (foundUser.email === email && foundUser.username === username) {
        return res.status(400).json({message: "Both Username and Email are taken."});
      } else if (foundUser.email === email) {
        return res.status(400).json({message: "Email is already taken."});
      } else {
        return res.status(400).json({message: "Username is already taken."});
      }
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdUser = await Users.create({
      name,
      username,
      email,
      password: hashedPassword,
      image: "https://hips.hearstapps.com/hmg-prod/images/justin-bieber-gettyimages-1202421980.jpg?resize=1200:*",
      language
    })
    //JSON Web Token Logic
    res.status(201).json({message: `Welcome ${createdUser.username}!`})
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "There was a error creating user."})
  }

});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if(!username || !password) {
    return res.status(400).json({message: "All fields are required. Try Again"});
  }

  try {
    const foundUser = await Users.findOne({username: username});
    if (!foundUser) return res.status(400).json({message: "Username or Password is incorrect."});
    if(bcrypt.compareSync(password, foundUser.password)) {
      //JWT Logic
      res.status(201).json({message: `Welcome ${foundUser.username}`})
    } else {
      return res.status(400).json({message: "Username or Password is incorrect."})
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "There was problem logging in."})
  }
});

router.post('/change-profile/:userId', async (req, res) => {
  //P: Only user can change their own profile details
  const { name, username, email, image, password, language } = req.body;

  try {
    if (username || email) {
      const existingUser = await Users.findOne({
        $or: [{ username }, { email }],
        _id: { $ne: req.params.userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists." });
      }
    }

    let updateFields = {}
    if (name) updateFields.name = name;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (image) updateFields.image = image;
    if (password) {
      const salt = bcrypt.genSaltSync();
      const hashedPassword = bcrypt.hashSync(password, salt);
      updateFields.password = hashedPassword;
    }
    if (language) updateFields.language = language;

    const updatedUser = await Users.findByIdAndUpdate(req.params.userId, 
      updateFields,
      {new: true }
    );
    //Update JWT
    res.status(201).json({message: `${updatedUser.username}'sProfile has been updated`})

  } catch (err) {
    console.log(err);
    res.status(500).json({message: "There was problem updating user."})
  }
});

router.get('/all', async (req, res) => {
  //:P Must be logged in
  try {
    const allUsers = await Users.find().select('-_id -createdAt -updatedAt -__v -password -conversations -email -pinned -language');
    res.status(200).json(allUsers)
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "There was problem getting all users."})
  }
});

router.get('/one/:userId', async (req, res) => {
  //:P Must be logged in
  try {
    const oneUsers = await Users.findById(req.params.userId)
    .select('-_id -createdAt -updatedAt -__v -password -conversations -email -pinned -language');
    res.status(200).json(oneUsers)
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "There was getting user."})
  }
});

module.exports = router;