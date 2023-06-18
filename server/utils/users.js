class Users {
  constructor() {
    this.users = {};
  }
  addUser(userId, socketId, name, room) {
    var user = { userId, socketId, name, room };
    this.users[userId] = user;
    return user;
  }
  removeUser(id) {
    const user = this.users[id];
    if (user) {
      delete this.users[id];
    }
    return user;
  }
  getCount(room) {
    return Object.values(this.users).filter((user) => user.room === room)
      .length;
  }
  getUser(id) {
    return this.users[id];
  }
  exists(id) {
    return !!this.users[id];
  }
  getUserList(room) {
    var users = Object.values(this.users).filter((user) => user.room === room);
    return users;
  }
}

module.exports = { Users };
