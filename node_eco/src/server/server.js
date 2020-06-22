'use strict'

const fastify = require('fastify');
//const AutoLoad = require('fastify-autoload');
const path = require('path');
const nconf= require('nconf');
const srv_routes = require('./routes/srv_routes');
const mongoose = require('mongoose')
const mongoConnector = require('./db/mongoconn');
//Swagger options
//const swagger = require('./config/swagger');

const startServer = async (opts) => {
    const { env, logSeverity, port, mongo_uri } = opts;
    // create the server
    const server = fastify({
      logger: { level: logSeverity }
    });

    // register the plugins, routes
    //await server.register(require('fastify-swagger'), swagger.options);

    await server.register(require('fastify-static'), {
      root: path.join(__dirname, '..', 'ui'),
    });

    await server.register(require('fastify-static'), {
      root: path.join(__dirname, '../ui', 'map'),
      prefix: '/map/',
      decorateReply: false
    });


    await server.register(mongoConnector, {uri: mongo_uri});

    await srv_routes.forEach((route, index) => {
        server.route(route);
    })

    // start the server
    const start = async () => {
      try {
        await server.listen(parseInt(port));
      //await server.swagger();
        server.log.info(`server listening on ${server.server.address().port}`)
      } catch (err) {
        server.log.error(err)
        process.exit(1)
      }
    }
    start();
}

module.exports = { startServer }
