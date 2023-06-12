class Users {
  constructor() {
    this.users = {};
  }
  addUser(id, name, room) {
    var user = { id, name, room };
    this.users[id] = user;
    return user;
  }
  removeUser(id) {
    const user = this.users[id];
    if (user) {
      delete this.users[id];
    }
    return user;
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

// class Person {
//   constructor (name, age) {
//     this.name = name;
//     this.age = age;
//   }
//   getUserDescription () {
//     return `${this.name} is ${this.age} year(s) old.`;
//   }
// }
//
// var me = new Person('Andrew', 25);
// var description = me.getUserDescription();
// console.log(description);
