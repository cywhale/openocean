import './style';
import App from './components/app';
import "cesium/Source/Widgets/widgets.css";

import buildModuleUrl from "cesium/Source/Core/buildModuleUrl";
//console.log("CESIUM_BASE_URL: ", CESIUM_BASE_URL);
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
//const BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
//BuildModuleUrl.setBaseUrl('./');
buildModuleUrl.setBaseUrl('./');

export default App;
