import { useState, useMemo } from 'preact/hooks'
import { createContext } from 'preact';

const ClusterContext = createContext();
const ClusterContextProvider = (props) => {//,...children
  const [cluster, setCluster] = useState({
    //loaded: false,
    showCluster: false,
    siteurl: '',
  });

  const clpars = useMemo(() => ({ cluster, setCluster }), [cluster]);

  return (
    <ClusterContext.Provider value={{ clpars }}>
      {props.children}
    </ClusterContext.Provider>
  );
};
export { ClusterContext, ClusterContextProvider };

