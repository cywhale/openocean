const boom = require('boom');
const path = require('path');
//const { html } = require('htm/preact');

// Add your API endpoints here
// fastify.get
//exports.home = async (req,res) => {
//  try {
    /*
    const root= html`
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>ECO NODE</title>
      </head>
      <body>
        <script type="module" src="index.js"></script>
      </body>
      </html>`
    res.header('Content-Type', 'text/html')
       .type('text/html')
       .view(root);
    */
//    res.sendFile("index.html", path.join(__dirname, '../..', 'ui'));
//  } catch (err) {
//    throw boom.boomify(err)
//  }
//};

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
  res.sendFile("earth.html", path.join(__dirname, '../../..', 'webgl'));
  } catch (err) {
    throw boom.boomify(err)
  }
};


