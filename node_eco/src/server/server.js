'use strict'

const fastify = require('fastify');
//const AutoLoad = require('fastify-autoload');
const fs = require('fs');
//const fsAutoPush = require('fastify-auto-push');
const path = require('path');
const nconf= require('nconf');
const srv_routes = require('./routes/srv_routes');
const mongoose = require('mongoose')
const mongoConnector = require('./db/mongoconn');
//Swagger options
//const swagger = require('./config/swagger');

//https://github.com/google/node-fastify-auto-push/blob/master/samples/static-page/index.js
//const argParser = new ArgumentParser({ addHelp: true; });
//argParser.addArgument(['--port', '-p'], { type: Number, defaultValue: 3000 }

async function configSecServ(certDir='config') { 
  const readCertFile = (filename) => {
    return fs.readFileSync(path.join(__dirname, certDir, filename));
  };

  const [key, cert] = await Promise.all(
      [readCertFile('privkey.pem'), readCertFile('fullchain.pem')]);
  return {key, cert, allowHTTP1: true};
}

const startServer = async (opts) => {
    const { env, logSeverity, port, mongo_uri } = opts;
    const {key, cert, allowHTTP1} = await configSecServ(); 
    // create the server
    const server = fastify({
      http2: true,
      trustProxy: true,
      https: {key, cert, allowHTTP1}, //{
        //allowHTTP1: true, 
        //key: fs.readFileSync(path.join(__dirname, 'config', 'privkey.pem')),
        //cert: fs.readFileSync(path.join(__dirname, 'config', 'fullchain.pem'))
      //},
      logger: { level: logSeverity }
    });

    // register the plugins, routes
    //await server.register(fsAutoPush.staticServe, {root: path.join(__dirname, '..', 'ui')}); 
    //await server.register(require('fastify-swagger'), swagger.options);
    
    await server.register(require('fastify-static'), {
      root: path.join(__dirname, '..', 'ui'),
    });

    await server.register(require('fastify-static'), {
      root: path.join(__dirname, '..', '..', 'webgl'),
      prefix: '/includes/',
      decorateReply: false
    });

    await server.register(mongoConnector, {uri: mongo_uri});

    await srv_routes.forEach((route, index) => {
        server.route(route);
    })

    //server.get('/', async (res, rep) => {
    //  await rep.writeHead(200)
    //})
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
