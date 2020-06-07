const mongoose = require("mongoose");

const spatialecoSchema = new mongoose.Schema({
  "category": [String],
  "article_type": [String],
  "analysis": {
    "research_targets": [String],
    "isMarine": Boolean,
    "recompile": Boolean,
    "isSpatial": Boolean
  },
  "measurement": {
    "variable": [String]
  },
  "format": [String],
  "materials": {
    "locality": String,
    "region_range": {
      "longitude": String,
      "latitude": String,
      "longitude_resolution": Number,
      "latitude_resolution": Number
    },
    "year_range": String
  }
});

module.exports = mongoose.model("SpatialEco", spatialecoSchema);
