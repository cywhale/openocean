import Static from 'fastify-static'
import Helmet from 'fastify-helmet'
//import path from 'path';
import { join } from 'desm'

export default async function (fastify, opts) {
  const {
    verifyToken,
    setToken
    //csrfProtection //for onRequest, that every route being protected by our authorization logic
  } = fastify

  const fopts = {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            fail: { type: 'string' }
          }
        }
      }
    }
  }

  //fastify.addHook('onRequest', authorize)

  fastify.register(Helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https:"],
        frameSrc: [
          "'self'",
          'https://nodeeco.firebaseapp.com/',
          'https://eco.odb.ntu.edu.tw',
          'https://ecodata.odb.ntu.edu.tw',
          'https://odbsso.oc.ntu.edu.tw/'
        ],
        scriptSrc: ["'self'", "https:", "'unsafe-eval'"],
        //'https://eco.odb.ntu.edu.tw',
        //'https://ecodata.odb.ntu.edu.tw',
        //'https://odbsso.oc.ntu.edu.tw/',
        //],
        connectSrc: ["'self'", "https:"],
        //'https://eco.odb.ntu.edu.tw',
        //'https://ecodata.odb.ntu.edu.tw',
        //'https://odbsso.oc.ntu.edu.tw/'
        //],
        imgSrc: ["'self'", "https:", "data:"],
        styleSrc: [
          "'self'",
          'https://eco.odb.ntu.edu.tw',
          "'unsafe-inline'"
        ]
      }
    }
  })

//fastify.get(url, opts={schema:{...}}, handler) ==> fastify.route({method:, url:, schemal:, handler:...})
//https://web.dev/codelab-text-compression-brotli
//try { await
  fastify.get('*.(js|json)', fopts, (req, res, next) => {
      if (req.header('Accept-Encoding').includes('br')) {
        req.url = req.url + '.br';
      //console.log(req.header('Accept-Encoding Brotli'));
        res.header('Content-Encoding', 'br');
        res.header('Content-Type', 'application/javascript; charset=UTF-8');
      } else {
        req.url = req.url + '.gz';
      //console.log(req.header('Accept-Encoding Gzip'));
        res.header('Content-Encoding', 'gzip');
        res.header('Content-Type', 'application/javascript; charset=UTF-8');
      }
      next();
  })
/*} catch (err) {
    app.log.info('Try .br, .gz got error: ' + err);
  }*/

  if (fastify.conf.port !== fastify.conf.devTestPort) { // for testing
    //try { await
    fastify.register(Static, {
        root: join(import.meta.url, '../..', 'client/build'), //path.join(__dirname, '..', 'client/build'),
        prefix: '/',
        prefixAvoidTrailingSlash: true,
        list: true,
        cacheControl: true,
        maxAge: 31536000000 //in ms
    })
    /*} catch (err) {
      app.log.info('Try serve ui/build error: ' + err);
    }*/
  }

  //try { await
  fastify.post(fastify.conf.sessiondir + '/init', fopts, async (req, res) => {
      if (req.cookies.token) {
        let verifyInit = verifyToken(req, res, fastify.config.COOKIE_SECRET, 'initSession');
        if (verifyInit) {
          res.code(200).send({success: 'Verified token already existed'}); //res.code(200).send
/*        if (!req.cookies.guest) {
          }*/
        } else {
          res.code(400).send({fail: 'Init token fail with wrong existed client token'});
        }
      } else {
        if (req.body.action === 'initSession') {
          setToken(req, res, fastify.config.COOKIE_SECRET, 'initSession');
        } else {
          res.code(400).send({fail: 'Init token fail with wrong client action'});
        }
      }
  })
  /*} catch (err) {
    app.log.info('Sent init cookie error' + err);
  }*/

  //try { await
  fastify.post(fastify.conf.sessiondir + '/login', fopts, async (req, res) => {
      if (req.cookies.token) {
        let verifyLogin = verifyToken(req, res, fastify.config.COOKIE_SECRET, 'initSession');

        if (verifyLogin) {
          if (!req.body.user) {
            res.code(400).send({fail: 'Token ok but no user while login'});
          } else {
            res.code(200).send({success: 'Token with user: ' + req.body.user});
          }
        } else {
          res.code(400).send({fail: 'Token failed when login verified after init'});
        }

      } else {
        res.code(400).send({fail: 'Need token in payload'})//);
      }
  })


  fastify.post(fastify.conf.sessiondir + '/verify', fopts, async (req, res) => {
      if (req.cookies.token) {
        let verifyLogin = verifyToken(req, res, fastify.config.COOKIE_SECRET, 'initSession');

        if (verifyLogin) {
          res.code(200).send({success: 'Verified with token.'});
        } else {
          res.code(400).send({fail: 'Token failed'});
        }
      } else {
        res.code(400).send({fail: 'Need token in payload'})//);
      }
  })
}
