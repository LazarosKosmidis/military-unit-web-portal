// server.jsx

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 🔌 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 📂 Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📂 Serve React (Vite dist)
app.use(express.static(path.join(__dirname, "dist")));

// 📎 Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* =========================================================
   👤 LOAD USERS FROM TXT
========================================================= */

function loadUsers() {
  const filePath = path.join(__dirname, "users.txt");

  // if file does not exist
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const data = fs.readFileSync(filePath, "utf-8");

  return data
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [
              username,
              password,
              displayName
            ] = line.split(":");

      return {
        username,
        password,
        displayName
      };
    });
}

/* =========================================================
   🔐 LOGIN
========================================================= */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();

  const user = users.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (user) {
    return res.json({
      success: true,

      username: user.username,

      displayName: user.displayName
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

/* =========================================================
   📤 FILE UPLOAD
========================================================= */

app.post("/upload", upload.single("file"), (req, res) => {
  const protocol = req.protocol;
  const host = req.get("host");

  const fileUrl =
    `${protocol}://${host}/uploads/${req.file.filename}`;

  res.json({
    url: fileUrl,
    name: req.file.originalname
  });
});

/* =========================================================
   💬 CHAT STORAGE
========================================================= */

let messages = [];

/* =========================================================
   🔌 SOCKET CONNECTION
========================================================= */

io.on("connection", (socket) => {
  console.log("User connected");

  // send old messages
  socket.emit("load messages", messages);

  // receive new message
  socket.on("chat message", (msg) => {

    const messageWithId = {
      id: Date.now(),
      createdAt: Date.now(),
      ...msg
    };

    messages.push(messageWithId);

    io.emit("chat message", messageWithId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* =========================================================
   🧹 AUTO DELETE MESSAGES EVERY 5 MINUTES
========================================================= */

setInterval(() => {

  const now = Date.now();

  const expiredMessages = messages.filter(
    msg => now - msg.createdAt > 86400000
  );

  expiredMessages.forEach(msg => {

    // delete uploaded file if exists
    if (msg.fileUrl) {

      try {

        const filename = path.basename(msg.fileUrl);

        const filePath = path.join(
          __dirname,
          "uploads",
          filename
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

      } catch (err) {
        console.error("File delete error:", err);
      }
    }

    // notify clients
    io.emit("delete message", msg.id);
  });

  // keep only non-expired messages
  messages = messages.filter(
    msg => now - msg.createdAt <= 86400000
  );

}, 300000); // every 5 minutes

/* =========================================================
   🔥 REACT FALLBACK
========================================================= */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "dist", "index.html")
  );
});

/* =========================================================
   🚀 START SERVER
========================================================= */

server.listen(3000, "0.0.0.0", () => {
  console.log(
    "Server running on http://0.0.0.0:3000"
  );
});