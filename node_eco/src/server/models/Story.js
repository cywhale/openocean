const mongoose = require("mongoose");
const storyId = mongoose.Schema.Types.storyId;

const storySchema = new mongoose.Schema({
{
  "story_id": String,
  "title": {
    "en": String,
    "tw": String,
  },
  "author": {
    "en": [String],
    "tw": [String]
  },
  "content": {
    "en": [String],
    "tw": [String]
  }
});

module.exports = mongoose.model("Story", storySchema);
