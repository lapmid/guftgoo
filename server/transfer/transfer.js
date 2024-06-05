
// auth.js

const express = require("express");
const router = express.Router();
const Transfer = require("./TransferEntity");
const { v4: uuidv4 } = require("uuid");

router.get("/get/:id", async (req, res) => {
  const {id} = req.params;
  console.log("get transfer request for "+id);
  try {
    const transfer = await Transfer.findOne({ id });
    res.status(200).json({ transfer });
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
    
    const transfer = new Transfer({ id: uuidv4(),content: content.content });
    await transfer.save();
    res.status(201).json({ message: "content saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

module.exports = router;
