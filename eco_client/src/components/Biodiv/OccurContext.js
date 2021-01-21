import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const OccurContext = createContext();
const OccurContextProvider = (props) => {
  const [occur, setOccur] = useState({
    selgbif: false,
  });

  const opars = useMemo(() => ({ occur, setOccur }), [occur]);

  return (
    <OccurContext.Provider value={{ opars }}>
      {props.children}
    </OccurContext.Provider>
  );
};
export { OccurContext, OccurContextProvider };

