//import { useMemo } from 'preact/hooks'; //useContext
import FlowContainer from './FlowContainer';
//import { FlowContext } from './FlowContext';

const Flows = (props) => {
  const { viewer, flow } = props; //,dataset
/*const { fpars } = useContext(FlowContext);
  const { flow, setFlow } = fpars;
*/
//  return useMemo (() => {
    return (<FlowContainer viewer={viewer} flow={flow} />)
//  }, [flow]);
};
export default Flows;

