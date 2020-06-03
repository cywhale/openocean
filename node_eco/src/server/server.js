'use strict'

const AutoLoad = require('fastify-autoload')
const path = require('path')

module.exports = async function(fastify, opts) {
  // serves static assets from the `src/ui` folder
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '..', 'ui'),
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, '../..', 'plugins'),
    options: Object.assign({}, opts)
  })
/*
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  })
*/
  // Add your API endpoints here
  fastify.get('/', async (req, res) => {
    res.send('Site Under Construction...')
  })

  fastify.get('/api/time', async (req, res) => {
    return { time: new Date().toISOString() }
  })
}
