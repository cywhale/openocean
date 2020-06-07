const mongoose = require("mongoose");
const storyId = mongoose.Schema.Types.storyId;

const metadataSchema = new mongoose.Schema({
  "story_id": String,
  "article": {
    "article_id": String,
    "title": String,
    "author": [String],
    "citation": String,
    "url": String,
    "pdf": String,
    "category": [String],
    "article_type": String,
    "keywords": [String],
    "analysis": {
      "research_targets": [String],
      "isMarine": Boolean,
      "recompile": Boolean,
      "isSpatial": Boolean,
      "needKriging": Boolean,
      "reproduce": [String]
    },
    "popsci": {
      "tw": String,
      "en": String,
    }
  },
  "data_raw_source": {
    "repository": String,
    "other_node": String
  },
  "collection": {
    "name": String,
    "datasetName": [String],
    "key": {
      "species": String,
      "longitude": String,
      "latitude": String,
      "time": {
        "year": String
      },
      "region": [String]
    },
    "measurement": {
      "variable": {
        "diversity": String,
        "CPUE": String
      }
    },
    "api": String,
    "metadata": String
  },
  "geojson": String,
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

module.exports = mongoose.model("Metadata", metadataSchema);
