import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const SateContext = createContext();
const SateContextProvider = (props) => {
  const [satellite, setSatellite] = useState({
    selmodis_truecolor: false,
  });

  const satepars = useMemo(() => ({ satellite, setSatellite }), [satellite]);

  return (
    <SateContext.Provider value={{ satepars }}>
      {props.children}
    </SateContext.Provider>
  );
};
export { SateContext, SateContextProvider };

