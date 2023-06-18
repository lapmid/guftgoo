const socketIO = require("socket.io");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

var users = new Users();

function getUserId(name, room) {
  return name + "||" + room;
}
function setupSocketIO(server) {
  var io = socketIO(server, {
    maxHttpBufferSize: 5 * 1e6,
    cors: { origin: "*" },
  });
  io.on("connection", (socket) => {
    console.log("New Conn", socket.id);
    socket.emit("connected");
    socket.on("join", (params) => {
      console.log(params);
      if (!isRealString(params.name) || !isRealString(params.room)) {
        return;
      }
      const userId = getUserId(params.name, params.room);
      if (users.exists(userId)) {
        users.removeUser(userId);
      }
      socket.data.name = params.name;
      socket.data.room = params.room;
      socket.data.userId = userId;
      socket.join(params.room);
      users.addUser(userId, socket.id, params.name, params.room);

      io.to(params.room).emit("updateUserList", users.getUserList(params.room));
      // io.to(params.room).emit(
      //   "newMessage",
      //   generateMessage(
      //     { name: "Admin", room: params.room, id: "Admin" },
      //     `${params.name} has joined`,
      //     "Text"
      //   )
      // );
    });

    socket.on("createMessage", (message) => {
      // console.log("createMessage");
      var user = users.getUser(socket.data.userId);
      if (user && isRealString(message.text)) {
        io.to(user.room).emit(
          "newMessage",
          generateMessage(user, message.text, "Text")
        );
      }
    });

    socket.on("createMessagePrivate", (toUser, message, type) => {
      var user = users.getUser(socket.data.userId);
      if (toUser && user && isRealString(message)) {
        socket
          .to(toUser.socketId)
          .emit("newMessage", generateMessage(user, message, type));
      }
    });

    socket.on("capturePhoto", () => {
      var user = users.getUser(socket.data.userId);
      if (user) {
        io.to(user.room).emit("capturePhoto", user);
      }
    });

    socket.on("fileUpload", (file, callback) => {
      var user = users.getUser(socket.data.userId);
      callback(true);
      if (user) {
        io.to(user.room).emit(
          "newMessage",
          generateMessage(user, file, "File")
        );
      }
    });

    socket.on("disconnect", () => {
      // console.log("disconnect");
      var user = users.removeUser(socket.data.userId);

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
}

module.exports = setupSocketIO;
