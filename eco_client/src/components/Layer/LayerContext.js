import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const LayerContext = createContext();
const LayerContextProvider = (props) => { 
  const [layerprops, setLayerprops] = useState({
    layerNoKnock: [],
    basename: '', // for viewModel can correctly setup baselayer when update Layer-list
    baselayer: null,
  });

  const laypars = useMemo(() => ({ layerprops, setLayerprops }), [layerprops]);

  return (
    <LayerContext.Provider value={{ laypars }}>
      {props.children}
    </LayerContext.Provider>
  );
};
export { LayerContext, LayerContextProvider };

