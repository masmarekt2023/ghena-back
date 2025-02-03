require('dotenv').config({ path: 'config.env' });
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const auth = require("./helper/auth");
const { chatServices } = require("./api/v1/services/chat");
const { messageServices } = require("./api/v1/services/message");
const { notificationServices } = require("./api/v1/services/notification");
const DepositController = require("./api/v1/controllers/blockchain/deposit");
const WithdrawCron = require("./cronJob/processAprrovedWithdrawals");
const DepositCron = require("./cronJob/processConfirmedDeposits");




class ExpressServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    // Initialize Socket.IO
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
      },
    });

    this.configureServer();
    this.configureSocket();
  }

  configureServer() {
    // Middleware setup
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(morgan("tiny"));
    this.app.disable("etag");

    // Serve static files (React build folder)
    this.app.use(express.static(path.join(__dirname, "build")));

    // Multer configuration for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });
    this.upload = multer({ storage });

    // Configure file upload routes
    this.configureFileUpload("/upload/document1", "document1");
    this.configureFileUpload("/upload/document2", "document2");
    this.configureFileUpload("/uploadImage", "image");
  }

  configureFileUpload(endpoint, field) {
    this.app.post(endpoint, this.upload.single(field), (req, res) => {
      const uploadedFile = req.file;
      console.log(`${field} uploaded:`, uploadedFile);
      res.json({ message: `${field} uploaded successfully` });
    });
  }

  configureSocket() {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;

      try {
        if (token) {
          const user = await auth.verifyTokenBySocket(token);
          console.log(user);
          if (user) {
            socket.userID = user._id;
            socket.userName = user.userName;
            return next();
          }
        }
        return next(new Error("Authentication error"));
      } catch (err) {
        return next(new Error("Unauthorized"));
      }
    });

    global.NotifySocket = this.io.of("/notifications");
    
    // NotifySocket.on("connection", async (socket) => {
    //   const user = socket.userID.toString();
    //   socket.join(user);

    //   const unread = await notificationServices.notificationList({
    //     userId: user,
    //     status: { $ne: "DELETE" },
    //     isRead: false,
    //   });

    //   if (unread && unread.length > 0) {
    //     NotifySocket.to(user).emit("notification", unread);
    //   }

    //   socket.on("error", (err) => {
    //     console.error("Socket error:", err.message);
    //     socket.disconnect();
    //   });
    // });



const SECRET_KEY = process.env.JWT_SECRET; // Use environment variables in production

// Middleware for socket authentication
NotifySocket.use((socket, next) => {
  // Extract token from handshake query or headers (for better flexibility)
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  console.log(token);
  // Log token only in development (don't log sensitive info in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Received token:', token);
  }

  // If no token is provided, deny connection
  if (!token) {
    return next(new Error("Authentication error: Token is missing"));
  }

  try {
    // Decode and verify JWT token using the secret key
    const decoded = jwt.verify(token, SECRET_KEY);

    // Attach user information (e.g., userID) to the socket object
    socket.userID = decoded.id;
    socket.username = decoded.username; // Example if username is part of the token

    // Proceed to the next middleware or connection handler
    next();
  } catch (err) {
    // Log error but don’t leak sensitive info
    console.error("Authentication error:", err.message);

    // Handle different errors for better clarity
    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("Authentication error: Token has expired"));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Error("Authentication error: Invalid token"));
    }

    // Fallback error message for any other issues
    return next(new Error("Authentication error: Unable to verify token"));
  }
});

// Middleware to handle authentication
//   NotifySocket.use((socket, next) => {
//   // Extract token from handshake
//   const token = socket.handshake.auth.token;

//   if (!token) {
//     return next(new Error("Authentication error: token is missing"));
//   }

//   try {
//     // Replace 'your-secret-key' with your actual JWT secret
//     const decoded = jwt.verify(token, 'your-secret-key');

//     // Attach userID to socket object
//     socket.userID = decoded.id;
//     next();  // Proceed to connection handler
//   } catch (err) {
//     console.error("Invalid token:", err.message);
//     next(new Error("Authentication error: invalid token"));
//   }
// });
   
    
    
// Socket connection handler
NotifySocket.on("connection", async (socket) => {
  console.log("Socket connected with user ID:", socket.userID); // Log the user ID

  // Ensure userID is available
  if (!socket.userID) {
    console.error("User ID is not defined, disconnecting socket.");
    socket.disconnect();
    return;
  }

  socket.join(socket.userID);  // Join the socket room based on user ID

  try {
    // Fetch unread notifications for the user
    const unread = await notificationServices.notificationList({
      userId: socket.userID, // Use socket's userID
      status: { $ne: "DELETE" },
      isRead: false,
    });

    // Emit notifications to the specific user
    if (unread && unread.length > 0) {
      NotifySocket.to(socket.userID).emit("notification", unread);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }

  // Handle socket errors
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
    socket.disconnect();
  });
});
    global.onlineUsers = new Map();

    this.io.on("connection", async (socket) => {
      const user = socket.userID.toString();

      if (onlineUsers.has(user)) {
        onlineUsers.get(user).add(socket.id);
      } else {
        onlineUsers.set(user, new Set([socket.id]));
        this.io.emit("notify", { onlineUsers: [...onlineUsers.keys()] });
      }

      const joinChats = await chatServices.chatList(socket.userID, {});
      joinChats.forEach((chat) => socket.join(chat._id.toString()));

      socket.on("sendMsg", async (data) => {
        const chatId = data.chat_id.toString();
        if (!socket.rooms.has(chatId)) {
          socket.join(chatId);
        }
        const msg = await messageServices.createMsg({
          chat: chatId,
          sender: socket.userID,
          text: data.message,
          mediaType: data.mediaType || "text",
        });
        this.io.to(chatId).emit(chatId, msg);
      });

      socket.on("disconnect", () => {
        onlineUsers.get(user)?.delete(socket.id);
        if (onlineUsers.get(user)?.size === 0) {
          onlineUsers.delete(user);
          this.io.emit("notify", { onlineUsers: [...onlineUsers.keys()] });
        }
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
        socket.disconnect();
      });
    });
  }

  async configureDb(dbUrl) {
    const dbUrll = "mongodb+srv://mas_backend:12345678mas@cluster0.1bbtm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    try {
      await mongoose.connect(dbUrll, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connection established");
    } catch (error) {
      console.error(`Error in MongoDB connection: ${error.message}`);
      throw error;
    }
  }

  router(routes) {
    routes(this.app);
    return this;
  }

  listen(port) {
    this.server.listen(port, () => {
      console.log(`App listening on port ${port} - ${new Date().toLocaleString()}`);
    });
  }

  startCronJobs() {
    WithdrawCron.start();
    DepositCron.start();
    DepositController.start();
  }
}

module.exports = ExpressServer;
