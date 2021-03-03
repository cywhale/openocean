import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const TerrainContext = createContext();
const TerrainContextProvider = (props) => {
  const [terrain, setTerrain] = useState({
    selwreck: false,
    wreck_min: -83.0,
    wreck_max: 0.0,
  });

  const terrpars = useMemo(() => ({ terrain, setTerrain }), [terrain]);

  return (
    <TerrainContext.Provider value={{ terrpars }}>
      {props.children}
    </TerrainContext.Provider>
  );
};
export { TerrainContext, TerrainContextProvider };

