const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

const publicPath = path.join(__dirname, "./public");
const port = process.env.PORT || 8080;

var cors = require("cors");
// const { unwatchFile } = require("fs");
var app = express();
var server = http.createServer(app);
var io = socketIO(server, {
  maxHttpBufferSize: 5 * 1e6,
  cors: { origin: "*" },
});
var users = new Users();

app.use(express.static(publicPath));
app.use(cors({ origins: "*" }));
io.on("connection", (socket) => {
  console.log("New Conn", socket.id);

  if (users.exists(socket.id)) {
    console.log("User already exists");
    return;
  }
  socket.emit("connected");

  socket.on("join", (params) => {
    console.log(params);
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return;
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUserList", users.getUserList(params.room));
    // socket.emit(
    //   "newMessage",
    //   generateMessage(
    //     { name: "Admin", room: params.room },
    //     "Welcome to the chat app"
    //   )
    // );
    // socket.broadcast
    io.to(params.room).emit(
      "newMessage",
      generateMessage(
        { name: "Admin", room: params.room, id: "Admin" },
        `${params.name} has joined`,
        "Text"
      )
    );
  });

  socket.on("createMessage", (message) => {
    var user = users.getUser(socket.id);
    console.log(message, user);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user, message.text, "Text")
      );
    }
  });
  socket.on("fileUpload", (file, callback) => {
    var user = users.getUser(socket.id);
    callback(true);
    if (user) {
      io.to(user.room).emit("newMessage", generateMessage(user, file, "File"));
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage(
          { name: "Admin", room: user.room, id: "Admin" },
          `${user.name} has left.`
        )
      );
    }
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});
server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
