// db.js

const mongoose = require("mongoose");

const uri = `mongodb+srv://${encodeURIComponent(
  process.env.MONGODB_USER
)}:${encodeURIComponent(
  process.env.MONGODB_PASS
)}@cluster0.rkvad.mongodb.net/?retryWrites=true&w=majority`;

// console.log("mogo db uri ", uri);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
