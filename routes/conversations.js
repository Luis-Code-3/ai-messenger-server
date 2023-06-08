var express = require('express');
var router = express.Router();
const Conversation = require('../models/Conversation.model');
const Users = require('../models/Users.model');


/* GET home page. */
router.get('/all/:userId', async (req, res) => {
    // P: only user that is inside of these conversations can retrieve the conversations
    // P: Must be logged in
  try {
    const foundConversations = await Conversation.find({members: {$in: [req.params.userId]}})
    .populate('members', '-password -conversations -email -pinned -language')
    .populate("admin", '-password -conversations -email -pinned -language'); 
    res.status(200).json(foundConversations);
  } catch (err) {
    console.log(err);
  }
});

router.get('/one/:conversationId', async (req, res) => {
    // P: only user that is inside of these conversations can retrieve the conversations
    // P: Must be logged in
    try {
        const foundConversation = await Conversation.findById(req.params.id)
        .populate('members', '-password -conversations -email -pinned -language')
        .populate('admin', '-password -conversations -email -pinned -language');
        res.status(200).json(foundConversation);
    } catch (err) {
        console.log(err);
    }
});

router.post('/create', async (req, res) => {
    // P: Check if solo conversation exists, can create any amount of similar groups
    // P: Must be logged in
    const { name, isGroup, image, members, admin} = req.body;

    try {
        const conversationData = {
            isGroup,
            lastMessageAt: Date.now(),
            members
        };

        if(isGroup) {
            conversationData.name = name;
            conversationData.image = image;
            conversationData.admin = admin;
        }

        const newConversation = await Conversation.create(conversationData);;
        res.status(200).json(newConversation);
    } catch (err) {
        console.log(err);
    }
});

router.post('/delete/:conversationId' , async (req, res) => {
    // P: Both users can delete solo conversation
    // P: Only users of the conversation can delete a solo conversation
    // P: Only admin can delete group conversation
    // P: Check if conversation exists
    // P: Must be logged in
    try {
        const deletedConversation = await Conversation.findByIdAndDelete(req.params.conversationId);
        res.status(200).json({message: "Deleted Conversation"})
    } catch (err) {
        console.log(err);
    }
});

router.post('/leave-group/:conversationId', async (req, res) => {
    // P: Can only leave groups, not solo conversations
    // P: Only users of the conversation can leave group
    // P: Update admin if he is the one leaving
    // P: Must be logged in
    const { userId } = req.body;
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(req.params.conversationId, 
            {$pull: { members: userId }},
            {new: true }
        );
        res.status(200).json({message: "Left the Group Chat"})
    } catch (err) {
        console.log(err);
    }
});

router.post('/remove-member/:conversationId', async (req, res) => {
    // P: Only admin of the group can remove members
    // P: This route only applies to groups
    // P: Must be logged in

    const { userId } = req.body;
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(req.params.conversationId, 
            {$pull: { members: userId }},
            {new: true }
        );
        res.status(200).json({message: "Removed Member from Group Chat"})
    } catch (err) {
        console.log(err);
    }
});

router.post('/add-member/:conversationId', async (req, res) => {
    // P: Only admin of the group can add members
    // P: This route only applies to groups
    // P: Must be logged in

    const { userId } = req.body;
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(req.params.conversationId, 
            {$addToSet: { members: userId }},
            {new: true }
        );
        res.status(200).json({message: "Added Member to the Group Chat"})
    } catch (err) {
        console.log(err);
    }
});


router.post('/new-pinned/:conversationId', async (req, res) => {
    // P: Only conversations that user is in can be pinned
    // P: Only user can pin conversations for themselves cannot for others
    // P: Must be logged in
    const { userId } = req.body;
    try {
        const newPinnedConvo = await Users.findByIdAndUpdate(userId, 
            {$addToSet: {pinned: req.params.conversationId}},
            {new: true}
            );

        res.status(200).json({message: "Conversation was pinned"})
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;

//P: protect routes later