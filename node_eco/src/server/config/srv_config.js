// source git: tarusharora/node-fastify-api-boilerplate configurationAdaptor.js
const nconf = require('nconf');
const _ = require('lodash');

// Read the configuration from command line.
// nconf.argv()
module.exports.loadSettings = ({ configPath }) => new Promise((resolve, reject) => {
  try {
    if (_.isEmpty(configPath)) {
      throw new Error('Configuration settings path is required.');
    }
    nconf.file({
      file: configPath, //'./.config.app.json'|| nconf.get('config-file-path'),
      // Setting the separator as dot for nested objects
      logicalSeparator: '.',
    });
    resolve();
  } catch (err) {
    reject(err);
  }
});
