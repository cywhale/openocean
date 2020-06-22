exports.options = {
  routePrefix: '/apidoc',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Eco Node API',
      description: 'API for Eco Node',
      version: '0.1.0'
    },
    host: 'eco.odb.ntu.edu.tw',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
}
