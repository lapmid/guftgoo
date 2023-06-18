const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

var generateMessage = (from, text, type) => {
  return {
    messageId: uuidv4(),
    from,
    text,
    type,
    createdAt: moment().valueOf(),
  };
};

module.exports = { generateMessage };
