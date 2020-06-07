'use strict'

const fastify = require('fastify');
//const AutoLoad = require('fastify-autoload');
const path = require('path');
const nconf= require('nconf');
const srv_routes = require('./routes/srv_routes');
const mongoose = require('mongoose')
const mongoConnector = require('./db/mongoconn');

const startServer = async (opts) => {
    const { env, logSeverity, port, mongo_uri } = opts;
    // create the server
    const server = fastify({
      logger: { level: logSeverity }
    });

    // register the plugins, routes
/*
    server.register(AutoLoad, {
      dir: path.join(__dirname, '../..', 'plugins'),
      options: Object.assign({}, opts)
    });
    server.register(AutoLoad, {
      dir: path.join(__dirname, 'api', 'routes')
    });
    server.register(jwt, {
      secret: nconf.get('secrets.jwt'),
    });
*/
    await server.register(require('fastify-static'), {
      root: path.join(__dirname, '..', 'ui'),
    });

    await server.register(mongoConnector, {uri: mongo_uri});

    await srv_routes.forEach((route, index) => {
        server.route(route)
    })

    // start the server
    const start = async () => {
      try {
        await server.listen(parseInt(port));
        server.log.info(`server listening on ${server.server.address().port}`)
      } catch (err) {
        server.log.error(err)
        process.exit(1)
      }
    }
    start();
}

module.exports = { startServer }
