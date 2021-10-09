import(/* webpackPrefetch: true */
       /* webpackPreload: true */'./style');
import App from './components/app';
import (/* webpackPrefetch: true */
        /* webpackPreload: true */
        "cesium/Source/Widgets/widgets.scss");
import(/* webpackPrefetch: true */
       /* webpackPreload: true */
       'style/style_earth.scss');
import sw_register from './sw_register';

import buildModuleUrl from "cesium/Source/Core/buildModuleUrl";
//console.log("CESIUM_BASE_URL: ", CESIUM_BASE_URL);
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
//const BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
//BuildModuleUrl.setBaseUrl('./');
buildModuleUrl.setBaseUrl('./');
sw_register();

export default App;
