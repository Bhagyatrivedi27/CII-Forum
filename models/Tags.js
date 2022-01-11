const mongoose = require("mongoose");

const TagsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  posts: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    },
  ],

  creationDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Tags = mongoose.model("tags", TagsSchema);
