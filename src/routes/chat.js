const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

// Get chat messages
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    // ✅ Ensure createdAt is sent in API response
    const formattedMessages = chat.messages.map((msg) => ({
      firstName: msg.senderId.firstName,
      lastName: msg.senderId.lastName,
      text: msg.text,
      time: msg.createdAt, // ✅ Include createdAt timestamp
    }));

    res.json({ messages: formattedMessages });
  } catch (err) {
    console.log(err);
  }
});

module.exports = chatRouter;
