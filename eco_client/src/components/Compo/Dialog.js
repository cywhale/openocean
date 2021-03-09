// refer: https://codesandbox.io/s/preact-createportal-renders-multiple-times-32ehe
// import { Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { createPortal, memo } from 'preact/compat';

import style from '../Layer/style_modal';
import style_ctrl from '../style/style_ctrlcompo';
import style_dialog from './style_dialog';

const Dialog = ({children, onCloseClick, isOpen}) => {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

//<div style="width:auto;max-width:18em;top:15%;left:18%;position:absolute;">
  const Wrapper = ({ children }) => ( //children;
    <div class={style_dialog.dialogwrapper}>
      {children}
    </div>
  );

  const Holder = ({ children }) => (
    <div class={style.modalOverlay}
	style={{
          fontSize: '0.9em',
	  transform: 'translateX(-50%)',
	  borderRadius: 5,
	  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
	  padding: 20,
	  zIndex: 100
       }}>
       {children}
    </div>
  );

  return(
    open &&
    createPortal(
      <Wrapper>
        <Holder>
          <div class={style.modalHeader} style="width:98%;min-width:98%">
            <a class={style.close} onClick={onCloseClick}>&times;</a>
          </div>
          <div class={style.ctrlwrapper}>
            <section class={style.ctrlsect}>
              { children }
            </section>
          </div>
        </Holder>
      </Wrapper>, document.body
    )
  );
};
export default memo(Dialog);

