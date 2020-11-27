import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const EarthContext = createContext();
const EarthContextProvider = (props) => {//,...children
  const [earth, setEarth] = useState({
    loaded: false,
    //base: '',
    //layers: '',
  });

  const gpars = useMemo(() => ({ earth, setEarth }), [earth]);

  //{{...children}}
  return (
    <EarthContext.Provider value={{ gpars }}>
      {props.children}
    </EarthContext.Provider>
  );
};
export { EarthContext, EarthContextProvider };

