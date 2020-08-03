import './style';
import App from './components/app';
import "cesium/Source/Widgets/widgets.css";

import buildModuleUrl from "cesium/Source/Core/buildModuleUrl";
buildModuleUrl.setBaseUrl('./');

export default App;
