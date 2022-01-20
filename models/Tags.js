const mongoose = require("mongoose");

const TagsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
  },

  creationDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Tags = mongoose.model("tags", TagsSchema);
