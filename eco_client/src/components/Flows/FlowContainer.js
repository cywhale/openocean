import { useEffect, useState, useContext, useCallback } from 'preact/hooks';
import SvgLoading from 'async!../Compo/SvgLoading';
//import { FlowContext } from './FlowContext';
import WindyContainer from './WindyContainer'; //current, flow for Windy
//const { layerConfig } = require('../Layer/.setting.js');

const FlowContainer = (props) => {
  const { viewer, flow } = props; //, dataset
//const { fpars } = useContext(FlowContext);
//const { flow, setFlow } = fpars;

  const [ gfs, setGFS ] = useState({
    data: null,
    date: '',
    time: '',
    isLoading: true,
  });

  const render_windjs = async (flowx) => { //useCallback(
    const enable = flowx.selgfs;
    const baseurl= flowx.base;
    const dataset= flowx.dataset;
    if (enable && dataset.date !== '' && dataset.time !== '' &&
        (gfs.data === null || gfs.date !== dataset.date || gfs.time !== dataset.time)) {
      const params = { viewer: viewer,
                       dataurl: baseurl + 'gfs_' + dataset.date.replace(/-/g, '') + dataset.time + '.json'
                     };
      await setGFS({ data: new WindyContainer(params),
                     date: dataset.date,
                     time: dataset.time,
                     isLoading: false  });
    } else if (enable) {
      let wind = document.getElementById("wind");
      if (wind.style.display === 'none') {
        await gfs.data.redraw();
      }
    } else if (!enable && gfs.data !== null) {
        await gfs.data.stop();
    }
  };//,[]);

  useEffect(() => {
      render_windjs(flow);
  }, [flow]);

  return (
    <SvgLoading enable = {flow.selgfs} isLoading = {gfs.isLoading} />
  );
};
export default FlowContainer;

