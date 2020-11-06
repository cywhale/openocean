import { useState } from 'preact/hooks'
import { createContext } from 'preact';

const EarthContext = createContext();
const EarthContextProvider = (props) => {//,...children
  const [earth, setEarth] = useState({
    loaded: false,
    //base: '',
    //layers: '',
  });
  //{{...children}}
  return (
    <EarthContext.Provider value={{ earth, setEarth }}>
      {props.children}
    </EarthContext.Provider>
  );
};
export { EarthContext, EarthContextProvider };

