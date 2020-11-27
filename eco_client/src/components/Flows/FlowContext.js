import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const FlowContext = createContext();
const FlowContextProvider = (props) => {
  const [flow, setFlow] = useState({
    selgfs: false,
    //selcurr: false,
    base: '',
    dataset: { // temporarily hard-coded here
        date: '2018-06-25',
        time: '00'
    },
  });

  const fpars = useMemo(() => ({ flow, setFlow }), [flow]);

  return (
    <FlowContext.Provider value={{ fpars }}>
      {props.children}
    </FlowContext.Provider>
  );
};
export { FlowContext, FlowContextProvider };

