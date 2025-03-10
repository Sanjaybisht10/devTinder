const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = ({ userId, targetUserId }) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const usersOnline = {}; // ✅ Track online users

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ User joins chat & becomes online
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId({ userId, targetUserId });
      socket.join(roomId);

      usersOnline[userId] = true; // ✅ Mark user as online
      io.to(roomId).emit("userOnline", { userId, status: "online" });
    });

    // ✅ Handle sending messages
    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      try {
        const roomId = getSecretRoomId({ userId, targetUserId });

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        const newMessage = {
          senderId: userId,
          text,
          createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        io.to(roomId).emit("messageReceived", {
          firstName,
          lastName,
          text,
          time: newMessage.createdAt,
        });
      } catch (err) {
        console.log(err);
      }
    });

    // ✅ Handle user disconnection
    socket.on("disconnect", () => {
      const disconnectedUser = Object.keys(usersOnline).find(
        (userId) => usersOnline[userId] === socket.id
      );
      if (disconnectedUser) {
        delete usersOnline[disconnectedUser];
        io.emit("userOffline", { userId: disconnectedUser, status: "offline" });
      }
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;
