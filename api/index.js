const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("atasa1"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const messageSchema = new mongoose.Schema({
  text: String,
  time: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", async (socket) => {
  console.log("User connected");
  const oldMessages = await Message.find().sort({ time: 1 });
  socket.emit("loadMessages", oldMessages);

  socket.on("chatMessage", async (msg) => {
    const message = new Message({ text: msg });
    await message.save();
    io.emit("chatMessage", message);
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

module.exports = app;
  