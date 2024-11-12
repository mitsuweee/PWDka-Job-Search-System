const HTTP = require("http");
const { Server } = require("socket.io"); // Importing Socket.IO
const app = require("./app");
const port = 8080;

const server = HTTP.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["pwdka.com.ph"], // Your frontend URL
    methods: ["GET", "POST"],
  },
});

// Listen for Socket.IO connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle receiving messages from the client
  socket.on("sendMessage", (data) => {
    console.log(`Message from ${socket.id}: ${data.message}`);
    // Broadcast the message to all connected clients
    io.emit("receiveMessage", data);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

global.io = io;

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
