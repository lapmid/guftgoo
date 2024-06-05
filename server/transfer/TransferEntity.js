const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  content: { type: String, required: true }
});

module.exports = mongoose.model("Transfer", transferSchema);
