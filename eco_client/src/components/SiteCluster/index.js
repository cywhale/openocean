//import { useMemo } from 'preact/hooks'; //useContext
import ClusterContainer from './ClusterContainer';
//import { ClusterContext } from './ClusterContext';

const SiteCluster = (props) => {
  const { viewer, cluster } = props;
/*const { clpars } = useContext(ClusterContext);
  const { cluster, setCluster } = clpars;
*/
//return useMemo (() => {
    return (<ClusterContainer viewer={viewer} cluster={cluster} />)
//}, [cluster]);
};
export default SiteCluster;

