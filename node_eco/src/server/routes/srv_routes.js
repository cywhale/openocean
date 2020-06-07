const srv_ctrl = require('../controllers/srv_ctrl');

const srv_routes = [{
    method: 'GET',
    url: '/api/time',
    handler: srv_ctrl.api_time
  },
  { /* GET Map page. */
    method: 'GET',
    url: '/map',
    handler: srv_ctrl.map
  }
]
module.exports = srv_routes
