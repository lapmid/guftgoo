
// auth.js

const express = require("express");
const router = express.Router();
const Transfer = require("./TransferEntity");

router.get("/get", async (req, res) => {
  console.log("get transfer request");
  try {
    res.status(201).json({ message: "content get successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

router.post("/save", async (req, res) => {
  console.log("got transfer request");
  try {
    const content = req.body;
    console.log("content has length  =  "+content.content.length);
    
    const transfer = new Transfer({ content: content.content });
    await transfer.save();
    res.status(201).json({ message: "content saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

module.exports = router;
