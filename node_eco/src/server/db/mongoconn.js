'use strict'

const fp = require('fastify-plugin');
const mongoose = require('mongoose');

const dbname = "testgeo"

const db_opts = {
  dbName: dbname,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
};

// Use of fastify-plugin is required to be able to export the decorators to the outer scope
async function mongoConnector(fastify, opts) {
  try {
    const db = await mongoose.connect(opts.uri, db_opts);
    console.log("MongoDB is connected!");
    fastify.decorate('mongo', db); //,function { return 'hugs' })
  } catch (err) {
    console.log(err);
  }
};
module.exports = fp(mongoConnector);
