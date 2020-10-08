import { useState, useEffect, useCallback } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
//import React from "preact/compat";
//import ReactDOM from "preact/compat";
import Select, { components } from 'react-select';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

const SortableMultiValue = SortableElement(props => {
  const onMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const innerProps = { onMouseDown };
  return <components.MultiValue {...props} innerProps={innerProps} />;
});
const SortableSelect = SortableContainer(Select);

const Region = (props) => {
  const { viewer } = props;
  const { dataSources } = viewer;

  const regionOptions = [
    { value: 0, label: 'White Dolphin Reserve' },
    { value: 1, label: 'Wild Animal Habitat' },
    { value: 2, label: 'Natural Reserve' },
  ];
  const [loaded, setLoaded] = useState([
    { loaded: false, show: false, urlfile: 'whitedolphin', color: Color.HOTPINK, index: -1},
    { loaded: false, show: false, urlfile: 'wildanimalreserve', color: Color.GOLD, index: -1},
    { loaded: false, show: false, urlfile: 'naturalreserve', color: Color.GREEN, index: -1}
  ]);
  //const [datasrc, setDatasrc] = useState([]);
  const [selected, setSelected] = useState(null); //React.useState
  //regionOptions[4],
  //regionOptions[5],
  //]);

  const updateRegionList = useCallback(() => {
    //if (selected) {
      const promises = [];
      const urlbase = 'https://ecodata.odb.ntu.edu.tw/pub/geojson/region/';
      const nlayers = regionOptions.length;
      let valx = [-1];
      if (selected) {
        valx = selected.map((item) => item.value); //return value obj .map(({ value }) => ({ value }))
      }
      let loadk = [...loaded];

      const geojsonLoad = (i, selIdx) => {
            //viewer.dataSources.add(
            GeoJsonDataSource.load(urlbase + loadk[i].urlfile + '.geojson', { // options
              stroke: loadk[i].color,
            //fill: Color.PINK.withAlpha(0.5),
              strokeWidth: 2,
              zIndex: nlayers-selIdx //first selected will be upper layer
            //}
            }).then(function(data) {
              dataSources.add(data);
              //setDatasrc(datasrc.push(data));
              setLoaded((state) => {
                state[i].loaded = true;
                state[i].show = true;
                state[i].index = dataSources._dataSources.length-1;
                return(state);
              });
            });
      };

      for (let i = nlayers - 1; i >= 0; --i) {
        let selIdx = valx.indexOf(regionOptions[i].value)
        if (selIdx > -1) {
          if (!loadk[i].loaded) {
            promises.push(geojsonLoad(i, selIdx));

          } else if (!loadk[i].show) { // already loaded
            dataSources._dataSources[loadk[i].index].zIndex = nlayers-selIdx;
            dataSources._dataSources[loadk[i].index].show = true;
            setLoaded((state) => {
                state[i].show = true;
                return(state);
            });

          }
        } else {
          if (loadk[i].show) { // not selected, so set it to false
            dataSources._dataSources[loadk[i].index].show = false;
            setLoaded((state) => {
                state[i].show = false;
                return(state);
            });
          }
        }
      }

      if (promises) {
        Promise.all(promises)
           .then((results) => {
               console.log("All Regions fetched");
           })
           .catch((e) => {
               console.log("Region fetched may wrong");
           });
      }
    //}
  }, [selected]);

  useEffect(() => {
    updateRegionList();
  }, [updateRegionList]);

  const onChange = selectedOptions => {
    setSelected(selectedOptions);
    //updateRegionList();
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newValue = arrayMove(selected, oldIndex, newIndex);
    setSelected(newValue);
    //console.log('Values sorted:', newValue.map(i => i.value));
    //updateRegionList();
  };

  return (
    <SortableSelect
      //ref: https://react-select.com/advanced
      // react-sortable-hoc props:
      axis="xy"
      onSortEnd={onSortEnd}
      distance={4}
      // small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
      getHelperDimensions={({ node }) => node.getBoundingClientRect()}
      // react-select props:
      isMulti
      options={regionOptions}
      value={selected}
      onChange={onChange}
      components={{
        MultiValue: SortableMultiValue,
      }}
      closeMenuOnSelect={false}
    />

  )
}
export default Region;
