import ClockRange from 'cesium/Source/Core/ClockRange';
import JulianDate from 'cesium/Source/Core/JulianDate';
import TimeIntervalCollection from 'cesium/Source/Core/TimeIntervalCollection';
import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const DateContext = createContext();
const DateContextProvider = (props) => {
  /* the same code in Datepicker/index.js to give a initial value for times, otherwise null cause problem */
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  const localTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
  const today = localTime.slice(0, 10);
  const currt = localTime.slice(11,19);
  const start_julian = new JulianDate.fromDate(new Date((new Date(today+'T00:00:00')).getTime() - tzoffset));
  const end_julian = new JulianDate.fromDate(new Date((new Date(today+'T'+currt)).getTime() - tzoffset));
  const clockdataCallback = (interval, index) => {
    let time;
    if (index === 0) { //index means inerval.length
      time = JulianDate.toIso8601(interval.stop);
    } else {
      time = JulianDate.toIso8601(interval.start);
    }
    return { Time: time, };
  }
  const times = TimeIntervalCollection.fromIso8601({
          iso8601: JulianDate.toIso8601(start_julian) + "/" + JulianDate.toIso8601(end_julian), //+ "/P4H",
          isStopIncluded: true,
          leadingInterval: false,
          trailingInterval: false,
          dataCallback: clockdataCallback,
        });
//console.log("Date in DateContext: ", start_julian, end_julian, times);

  const [clocktime, setClocktime] = useState({
    starttime: start_julian,
    endtime: end_julian,
    times: times,
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

