import AutoLoad from 'fastify-autoload'
import Sensible from 'fastify-sensible'
import Cors from 'fastify-cors'
import UnderPressure from 'under-pressure'
import Cookie from 'fastify-cookie'
import Mongodb from 'fastify-mongodb'
import { join } from 'desm'

export default async function (fastify, opts) {

  fastify.decorate('conf', {
    node_env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    devTestPort: 3003,
    sessiondir: process.env.NODE_ENV === 'production'? '/session' : '/sessioninfo'
  //searchdir : process.env.NODE_ENV === 'production'? '/search' : '/searchinfo'
  })

  fastify.register(Sensible)

  fastify.register(UnderPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 1000000000,
    maxRssBytes: 1000000000,
    maxEventLoopUtilization: 0.98
  })

  fastify.register(Cors, {
    origin: false
  })

  fastify.register(Cookie, {})

  fastify.register(Mongodb, {
      forceClose: true,
      url: fastify.config.MONGO_CONNECT,
      name: 'mongo1'
  })

  fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'routes'),
    dirNameRoutePrefix: false,
    options: Object.assign({}, opts)
  })
}

