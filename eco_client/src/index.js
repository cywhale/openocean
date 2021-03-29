import(/* webpackPrefetch: true */
       /* webpackPreload: true */'./style');
import App from './components/app';
import (/* webpackPrefetch: true */
        /* webpackPreload: true */
        "cesium/Source/Widgets/widgets.css");
import(/* webpackPrefetch: true */
       /* webpackPreload: true */
       'style/style_earth.css');

import buildModuleUrl from "cesium/Source/Core/buildModuleUrl";
//console.log("CESIUM_BASE_URL: ", CESIUM_BASE_URL);
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
//const BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
//BuildModuleUrl.setBaseUrl('./');
buildModuleUrl.setBaseUrl('./');

//https://web.dev/offline-fallback-page/
window.addEventListener("load", () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: './' })
        .then((registration) => {
         console.log("service worker registration successful", registration);
        })
        .catch((err) => {
         console.log("service worker registration failed", err);
        });
      }
});

window.addEventListener('online', () => {
      window.location.reload();
});

export default App;
