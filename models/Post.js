const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  username: {
    type: String,
    max: 20,
  },

  title: {
    type: String,
    max: 20,
  },

  body: {
    type: String,
    max: 500,
  },

  img: {
    type: String,
  },

  likes: {
    type: Array,
    default: [],
  },

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Posts = mongoose.model("post", PostSchema);
