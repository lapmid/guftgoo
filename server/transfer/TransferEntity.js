const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model("Transfer", transferSchema);
