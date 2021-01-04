import ClockRange from 'cesium/Source/Core/ClockRange';
import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const DateContext = createContext();
const DateContextProvider = (props) => {

  const [clocktime, setClocktime] = useState({
    starttime: null,
    endtime: null,
    times: null,
    clockRange: ClockRange.LOOP_STOP,
    clockMultiplier: 1200, // 20 mins
    secInterval: 14400,   // 4 hours * 3 (to fetch another WMTS source, for ex)
  });

  const tkpars = useMemo(() => ({ clocktime, setClocktime }), [clocktime]);

  return (
    <DateContext.Provider value={{ tkpars }}>
      {props.children}
    </DateContext.Provider>
  );
};
export { DateContext, DateContextProvider };

