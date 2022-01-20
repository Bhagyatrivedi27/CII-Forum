const express = require("express");

const router = express.Router();

const Tags = require("../../models/Tags");

const slugify = require("slugify");

// @Route  POST api/tags/create
// @desc   Create Tag
// @access Admin
router.post("/create", async (req, res) => {
  const tagObj = {
    name: req.body.name,
    slug: slugify(req.body.name),
  };

  const newTag = new Tags(tagObj);
  try {
    const savedTag = await newTag.save();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @Route  GET api/tags/
// @desc   Get Tags
// @access Private
router.get("/", async (req, res) => {
  try {
    const tags = await Tags.find({}).sort("-date");
    if (!tags) {
      return res.status(403).json({ msg: "No Tags" });
    } else {
      return res.status(200).json(tags);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});




module.exports = router;
