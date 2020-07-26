import style from './style_Modal.scss'; //https://codepen.io/thomgriggs/pen/EbGAK

const ToolModal = () => {
  return (
    <div style="display:flex;">
      <div class={style.toolToggle}>
         <a class={style.toolButn} href="#toolModal"><i></i></a>
      </div>
      <div id="toolModal" class={style.modaloverlay}>
        <div class={style.modal}>
          <a href="#close" class={style.close}>&times;</a>
         <div>
           <h1>Test</h1>
           <p>Some comments here</p>
         </div>
       </div>
     </div>
   </div>
  );
};
export default ToolModal;
