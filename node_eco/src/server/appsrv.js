const nconf = require('nconf');
const boom = require('boom')
const server = require('./server');
const configPath = process.env.APP_SETTINGS_FILE_PATH;
const { loadSettings } = require('./routines/srv_config');

const appsrv = async () => {
  try {
    await loadSettings({ configPath });
    //Read config required for starting the server
    let srvOpts = {
        logSeverity: nconf.get('apps.logSeverity'),
        port: nconf.get('apps.port')
    };
    console.log(srvOpts);
    server.startServer(srvOpts); //start server
  } catch (err) {
    throw boom.boomify(err)
  }
};

appsrv();

