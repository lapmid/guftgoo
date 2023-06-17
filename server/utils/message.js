const moment = require("moment");
const { uuid } = require("uuidv4");

var generateMessage = (from, text, type) => {
  return {
    messageId: uuid(),
    from,
    text,
    type,
    createdAt: moment().valueOf(),
  };
};

module.exports = { generateMessage };
