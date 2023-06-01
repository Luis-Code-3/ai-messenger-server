var express = require('express');
var router = express.Router();
const Message = require('../models/Message.model');


/* GET home page. */
router.get('/all/:convoId', async (req, res) => {
    // P: Only members inside the conversation can retrieve this
    // P: Must be logged in
  try {
    const foundMessages = await Message.find({conversation: req.params.convoId});
    res.status(200).json(foundMessages);
  } catch (err) {
    console.log(err);
  }
});

router.post('/create', async (req, res) => {
    // P: Needs a Conversation Id, and the sender of this message must also be in that conversation.
    // P: Must be logged in
    const { text, image, conversation, sender } = req.body;

    try {
        const newMessage = await Message.create({
            text,
            image,
            conversation,
            sender,
            seenIds: sender
        });
        res.status(200).json({message: "Created new Message"})
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;

//Add protections later