//import { render } from 'preact';
//import { useState, useEffect } from 'preact/hooks';
import style from './style_svgloading';

const SvgLoading = (props) => { //async(dom) =>
  const { enable, isLoading } = props;
/*const [ svg, setSvg ] = useState({
    class: `${style.Redo} ${style.notbusy}`,
  })
*/
//useEffect(() => {
  const getSvgClass = () => {
    let svgClass;
    if (!enable) {
      svgClass=`${style.Redo} ${style.notbusy}`;
    } else {
      if (!isLoading) {
        svgClass=`${style.Redo} ${style.notbusy}`;
      } else {
        svgClass=`${style.Redo}`
      }
    }
    console.log("Toggle svgClasss: " + svgClass + " when isLoaing is: " + isLoading);
    return(svgClass);
//  setSvg({ class: svgClass });
  };//, [enable, isLoading]);

  //await render(
  return(
  <div class={getSvgClass()} isLoading={isLoading}>
  { enable &&
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
       width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xmlSpace="preserve">
      <rect x="0" y="10" width="4" height="10" fill="#333" opacity="0.2">
        <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="8" y="10" width="4" height="10" fill="#333"  opacity="0.2">
        <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="16" y="10" width="4" height="10" fill="#333"  opacity="0.2">
        <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  }
  </div>
  );
};
export default SvgLoading;
