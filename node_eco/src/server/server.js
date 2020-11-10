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

const configSecServ = async (certDir='config') => {
  const readCertFile = (filename) => {
    return fs.readFileSync(path.join(__dirname, certDir, filename));
  };
  try {
    const [key, cert] = await Promise.all(
      [readCertFile('privkey.pem'), readCertFile('fullchain.pem')]);
    return {key, cert, allowHTTP1: true};
  } catch (err) {
    console.log('Error: certifite failed. ' + err);
    process.exit(1);
  }
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
    //https://web.dev/codelab-text-compression-brotli
    try {
      await server.get('*.js', (req, res, next) => {
        if (req.header('Accept-Encoding').includes('br')) {
          req.url = req.url + '.br';
          console.log(req.header('Accept-Encoding Brotli'));
          res.set('Content-Encoding', 'br');
          res.set('Content-Type', 'application/javascript; charset=UTF-8');
        } else {
          req.url = req.url + '.gz';
          console.log(req.header('Accept-Encoding Gzip'));
          res.set('Content-Encoding', 'gzip');
          res.set('Content-Type', 'application/javascript; charset=UTF-8');
        }
        next();
      });
    } catch (err) {
      server.log.error('Error: Accept-encoding fail, ' + err);
    }
    // register the plugins, routes
    //await server.register(fsAutoPush.staticServe, {root: path.join(__dirname, '..', 'ui')});
    //await server.register(require('fastify-swagger'), swagger.options);
    try {
      await server.register(require('fastify-static'), {
        root: path.join(__dirname, '..', 'ui/build'),
        prefix: '/',
        prefixAvoidTrailingSlash: true,
        list: true /* {
          format: 'html',
          names: ['index', 'index.html', '/']
        }*/
      });
    } catch (err) {
      server.log.error('Error: Serve static ui/build, ' + err);
    }

    try {
      await server.register(require('fastify-static'), {
        root: path.join(__dirname, '..', '..', 'webgl'),
        prefix: '/includes/',
        decorateReply: false
      });
    } catch (err) {
      server.log.error('Error: a trial static(webglearth), ' + err);
    }
    try {
      await server.register(mongoConnector, {uri: mongo_uri});
    } catch (err) {
      server.log.error('Error: Mongo connect fail, ' + err);
    }
    try {
      await srv_routes.forEach((route, index) => {
        server.route(route);
      });
    } catch (err) {
      server.log.error('Error: Serve each route fail, ' + err);
    }

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
