import { render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Geocoder from 'cesium/Source/Widgets/Geocoder/Geocoder';
import style from '../style/style_layerctrl';

const UserSearch = (props) => {
  const { viewer } = props;
  const [state, setState] = useState(false);
  const [searchLayer, setSearchLayer] = useState('');
  const [result, setResult] = useState({
    geocode: null,
    geocode_place: '',
    layer: '',
  });
  const searchx = process.env.NODE_ENV === 'production'? 'search/' : 'searchinfo/';

/* old test code from fastify-preact
  const onLayerSearch = () => {
    let term = document.getElementById("searchtxt").value;
    if (term !== '') {
      console.log('Searching: ', term);
      setSearchLayer(term);
    }
  }
*/
  const set_searchingtext= (elem_search, dom, evt) => {
    let x = elem_search.value;
    if (x && x.trim() !== "" && x !== dom.dataset.search) {
      dom.dataset.searchin = x;
    }
  };

  const get_searchingtext = (dom, evt) => {
    //let REGEX_EAST = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/;
    //if (dom.dataset.search && dom.dataset.search.trim() !== "") { //|| dom.dataset.search.match(REGEX_EAST))
    setSearchLayer(dom.dataset.searchin);
    dom.dataset.searchout = dom.dataset.searchin;
  };

  const enable_search_listener = async () => {
    let elem_search = document.querySelector(".cesium-geocoder-input");
    let search_term = document.getElementById("searchxdiv");
    let butt_search = document.querySelector(".cesium-geocoder-searchButton");
    await elem_search.addEventListener("change", set_searchingtext.bind(null, elem_search, search_term), false);
    await elem_search.addEventListener("search",get_searchingtext.bind(null, search_term), false);
    await butt_search.addEventListener("click", get_searchingtext.bind(null, search_term), false);
  }

  const sendSearch = async (searchtxt) => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    headers.append('Accept', 'application/json');
    let searchurl = searchx + 'layers/' + searchtxt;

    try {
      await fetch(searchurl, {
        method: 'GET',
        //mode: 'same-origin',
        //redirect: 'follow',
        //credentials: 'include',
        //withCredentials: true,
        headers: headers,
        //body: JSON.stringify( {})
      })
      .then(res => res.json())
      .then(json => {
        let data = JSON.stringify(json);
        if (data === null || data === '' || data === '{}' || data === '[]') {
          return(setResult((prev) => ({
              ...prev,
              layer: 'Layer not found...'
            }))
          )
        }
        return(
          setResult((prev) => ({
              ...prev,
              layer: data
          }))
        );
      });
    } catch(err) {
      console.log("Error when search: ", err);
    }
  }

  useEffect(() => {
    if(!state) {
      let geocoder = new Geocoder({
            container: 'geocoderContainer',
	    scene: viewer.scene
      });
      enable_search_listener();
      geocoder.viewModel.destinationFound = function(viewModel, destination) { //viewer.geocoder
        //viewer.camera.flyTo({
        //destination: destination
        //});
        //console.log("Going to by search: ", viewModel.searchText, destination);
        setResult((prev) => ({
            ...prev,
            geocode: destination,
            geocode_place: viewModel.searchText
        }))
      };
      setState(true);
    } else {
      if (searchLayer !== '') {
        sendSearch(searchLayer);
        //let uri = window.location.toString();
        //let clean_uri = uri.substring(0, uri.indexOf("#"));
        //window.history.replaceState({}, document.title, clean_uri + '#search');
        history.pushState(null, null, '#search');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  }, [state, searchLayer]);

  const render_searchresult = (output) => {
      return(
        render(<div>
                 <div id="geocoderContainer" style="position:relative;top:0px;margin:10px;"/>
                 <div>
                   { output.layer === '' && <p>Not perform searching yet...</p>}
                   { output.layer !== '' && <p>{output.layer}</p>}
                 </div>
                 { output.geocode !== null &&
                 <div><hr /><button id="toGeocodeBut" class={style.ctrlbutn} onClick={() => {viewer.camera.flyTo({destination: output.geocode})}}>
                   Fly to {output.geocode_place}
                 </button></div> }
               </div>,
               document.getElementById('resultxdiv'))
      )
  };

  return (
    <Fragment>
      { render_searchresult(result) }
    </Fragment>
  )
};
export default UserSearch;
