const boom = require('boom')

// Add your API endpoints here
// fastify.get
exports.api_time = async (req, res) => {
    return { time: new Date().toISOString() }
};

exports.map = async (req,res) => {
  try {
/*
    await Geo.find({},{}, function(e, geo) {
        res.view('../views/map.pug', {
          "jmap" : geo,
          lat : 40.78854,
          lng : -73.96374
        });
    });
    return res;
*/
  res.send("Temporarily a route test...")
  } catch (err) {
    throw boom.boomify(err)
  }
};


