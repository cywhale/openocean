//https://github.com/arqex/react-datetime0
//https://github.com/arqex/react-datetime/issues/105
//https://github.com/NateRadebaugh/react-datetime/
//import Timeline from 'cesium/Source/Widgets/Timeline/Timeline.js';
//import ClockRange from 'cesium/Source/Core/ClockRange';
import JulianDate from 'cesium/Source/Core/JulianDate';
//import TimeInterval from 'cesium/Source/Core/TimeInterval';
import TimeIntervalCollection from 'cesium/Source/Core/TimeIntervalCollection';
import { useState, useEffect, useRef, useContext } from 'preact/hooks';
//import "react-datetime/css/react-datetime.css";
//import Datetime from "react-datetime";
//import DateTime from "@nateradebaugh/react-datetime";
//import "@nateradebaugh/react-datetime/scss/styles.scss";
//import moment from "moment";
import { DateContext } from "./DateContext";

import style from './style';

const Datepicker = (props) => {
  const { viewer } = props;
  const { clock, timeline } = viewer;

//Note: toISOSTring will ignore timezone ofset
//const formatYmd = date => date.toISOString().slice(0, 10); //2020-01-01T00:00:00
//const formatTime= date => date.toISOString().slice(11,19);
//let tdt = new Date();
//let utct = new Date(tdt.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  const localTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

  const today = localTime.slice(0, 10);
  const currt = localTime.slice(11,19);
  //console.log("Get today: ",today);
  //console.log("Get time: ", currt);

  const isValidDate = (date) => { return date.toString() !== 'Invalid Date'; }
  const starttimeRef = useRef(null);
  const endtimeRef = useRef(null);

  const { tkpars } = useContext(DateContext);
  const { clocktime, setClocktime } = tkpars;
  const [ datetime, setDatetime ] = useState({
    startdate: today,
    starttime: '00:00:00',
    enddate: today,
    endtime: currt,
  })
  const [state, setState] = useState({
    enableAnimate: false,
  })

  const toggleAnimate = e => {
    let shouldAnimate = !state.enableAnimate

    if (shouldAnimate) {
      clock.currentTime = clock.startTime;
      clock.clockRange = clocktime.clockRange //.LOOP_STOP;
      clock.multiplier = clocktime.clockMultiplier;
    } else {
      clock.currentTime = clock.stopTime;
    }
    clock.shouldAnimate = shouldAnimate;

    setState((preState) => ({
        ...preState,
        enableAnimate: shouldAnimate,
    }));
  }

  const clockdataCallback = (interval, index) => {
    let time;
    if (index === 0) { //index means inerval.length
    // leading
      time = JulianDate.toIso8601(interval.stop);
    } else {
      time = JulianDate.toIso8601(interval.start);
    }
    return { Time: time, };
  }

  useEffect(() => {
    const startt = new Date((new Date(datetime.startdate+'T'+datetime.starttime)).getTime() - tzoffset);
    const endt = new Date((new Date(datetime.enddate+'T'+datetime.endtime)).getTime() - tzoffset);

    let stt, ett, start_julian, end_julian;
    if (starttimeRef.current && isValidDate(startt) &&
        endtimeRef.current && isValidDate(endt)) {
      stt = startt.getTime();
      ett = endt.getTime();
      if (stt>ett) {
        start_julian = new JulianDate.fromDate(endt);
        end_julian = new JulianDate.fromDate(startt);
        stt = endt.getTime();
        ett = startt.getTime();
      } else {
        start_julian = new JulianDate.fromDate(startt);
        end_julian = new JulianDate.fromDate(endt);
      }

      clock.startTime = start_julian;
      clock.currentTime = end_julian;
      clock.stopTime = end_julian;
      timeline.zoomTo(start_julian, end_julian);
      //console.log("To end date: ", JulianDate.toDate(clock.stopTime));
      //console.log("To Time ineterval: ", JulianDate.toIso8601(start_julian) + "/" + JulianDate.toIso8601(end_julian) + "/P4H");

      let intervalMul = 1;
      let secInterval = clocktime.secInterval * intervalMul;
      let intervalNum = Math.floor((ett-stt)/1000.0/secInterval);
      let interval, times;

      console.log("Dispatch new intervals: ",  intervalNum);
      if (intervalNum < 1) {
      //https://www.digi.com/resources/documentation/digidocs/90001437-13/reference/r_iso_8601_duration_format.$
        times = TimeIntervalCollection.fromIso8601({
          iso8601: JulianDate.toIso8601(start_julian) + "/" + JulianDate.toIso8601(end_julian), //+ "/P4H",
          isStopIncluded: true,
          leadingInterval: false,
          trailingInterval: false,
          dataCallback: clockdataCallback,
        });
      } else {
        //times = new TimeIntervalCollection(); //NOT work for unknown reasons cannot be accepted by WMTS
        //new times by i = 0
        let nowtt = [start_julian]; //.clone()
        let nextt; // = new JulianDate();
        for (let i=1; i < intervalNum; i++) {
          //let dua = Math.floor(secInterval/(60 * 60)) // to hours
          nextt = JulianDate.addSeconds(start_julian, secInterval * i, new JulianDate());
          nowtt.push(nextt);
        }
        if (JulianDate.compare(nextt, end_julian) < 0) {
          nowtt.push(end_julian);
        }
        //console.log("Now, Next: ", nowtt, JulianDate.toDate(nextt));
        times = TimeIntervalCollection.fromJulianDateArray({ //fromIso8601({
          //iso8601: JulianDate.toIso8601(start_julian) + "/" + JulianDate.toIso8601(end_julian) + "/P" + dua + "H",
          julianDates: nowtt,
          isStartIncluded: true,
          isStopIncluded: true,
          leadingInterval: false,
          trailingInterval: false,
          dataCallback: clockdataCallback,
        });
      }
      //console.log("In Datepicker after add intervals:", times);
      setClocktime((preState) => ({
        ...preState,
        starttime: start_julian,
        endtime: end_julian,
        times: times,
      }));
    }
  }, [datetime]);
/*
  const myrenderView = (mode, renderDefault) => {
    // Only for years, months and days view
    if (mode === "time") return renderDefault();
        <div className="controls">
          <button onClick={() => this.goToToday()}>Today</button>
        </div>
    return (
      <div class="wrapper">
        {renderDefault()}
      </div>
    );
  }

  let inputProps1 = {
    placeholder: 'Start date-time',
    //disabled: true,
    //onMouseLeave: () => alert('')
  };
    <Datetime inputProps={ inputProps1 }
              onChange={(val) => {console.log("Start time now: ", val.format("YYYY-MM-DD HH:mm:ss"))}}
              onClose={(val) => {setStart(val.format("YYYY-MM-DD HH:mm:ss"))}} /> */
/*const setStart = async (dtime) => {
    console.log("Start time is: ", dtime);
    await setDatetime((preState) => ({
        ...preState,
        start: dtime,
    }));
  };

  const setEnd = async (dtime) => {
    console.log("End time is: ", dtime);
    await setDatetime((preState) => ({
        ...preState,
        end: dtime,
    }));
  };
      <DateTime dateFormat="yyyy-LL-dd" timeFormat="HH:mm:ss"
        renderView={(mode, renderDefault) =>
          myrenderView(mode, renderDefault)
        } onChange={(val) => {setStart(val)}} />
      <DateTime dateFormat="yyyy-LL-dd" timeFormat="HH:mm:ss"
        renderView={(mode, renderDefault) =>
          myrenderView(mode, renderDefault)
        } onChange={(val) => {setEnd(val)}} />*/
  return(
    <div style="display:block;">
      <div class={style.dtimepick} ref={starttimeRef}>
        <label>Start time◷</label>
        <input id="startdate" name="startdate" type="date" value={datetime.startdate}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 startdate: e.target.value,
               }))}} />
        <input id="startime" name="starttime" type="time" min="00:00:00" max="23:59:59" step={1}
               value={datetime.starttime}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 starttime: e.target.value,
               }))}} />
      </div>
      <div class={style.dtimepick} ref={endtimeRef}>
        <label>End time◵</label>
        <input id="enddate" name="enddate" type="date" value={datetime.enddate}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 enddate: e.target.value,
               }))}} />
        <input id="endtime" name="endtime" type="time" min="00:00:00" max="23:59:59" step={1}
               value={datetime.endtime}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 endtime: e.target.value,
               }))}} />
      </div>
      <div style="display:block;">
        <label>
          <input style="width:auto;" id="enableAnimate" type="checkbox" checked={state.enableAnimate} onClick={toggleAnimate} />
          <span style="font-size:small">Time-interval animation</span>
        </label>
      </div>
    </div>
  );
};
export default Datepicker;
