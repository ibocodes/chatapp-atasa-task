const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config(); // ✅ Load environment variables

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  text: String,
  time: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Serve static files
app.use(express.static('atasa1'));

// Socket.io logic
io.on('connection', async socket => {
  console.log('User connected');

  // Send chat history
  const oldMessages = await Message.find().sort({ time: 1 });
  socket.emit('loadMessages', oldMessages);

  // When a message is sent
  socket.on('chatMessage', async msg => {
    const message = new Message({ text: msg });
    await message.save();
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
