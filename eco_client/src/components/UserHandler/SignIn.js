import { useContext, useState, useCallback } from "preact/hooks";
import { UserContext } from "./UserContext"
import { auth, googleAuthProvider } from './firebase';
import Popup from 'async!../Compo/Popup';
import sessionInfo from './sessionInfo';
import style from './style_signin';

const SignIn = (props) => {
  const { ucode, rurl } = props; //handleSSOChange
  const { upars } = useContext(UserContext);
  const { user, setUser } = upars;
  const [state, setState] = useState({
    //ssostate: '',
    redirect: '',
    popup: false
  });
/*const [user, setUser] = useState({
    name: '',
    auth: '', //odb, gmail
    photoURL: '',
    //token: '',
  });
*/
  const checkAuth = async () => {
    //console.log("ODB SSO iframe src change");
    return (
      await setUser((preState) => ({
        ...preState,
        auth: 'odb',
        token: ucode
      }))
    );
  }

  const closePopup = () => {
    //OdbAuth(ucode.str, false);
    checkAuth();
    setState((preState) => ({
      ...preState,
      redirect: '',
      popup: false
    }));
    //return(() => handleSSOChange);
  }

  const renderRedirect = useCallback(() => {
    //const rurl = odbConfig.base + odbConfig.login;
    //route(rurl);
    //window.location.href = rurl;
    const location = rurl + "?ucode=" + ucode;// + "&nurl="+window.location.href; //no need nurl on iframe
    //history.location; //is an obj with (a.pathname + a.search + a.hash)
    //history.push(rurl+"?ucode=" + ucode.str + "&nurl="+window.location.href);
    setState((preState) => ({
        ...preState,
        redirect: location,
        popup: true
    }));
  }, [ucode]);

  const renderFirePopup = useCallback((fireauth, fireprovider) => {
    fireauth.signInWithPopup(fireprovider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken; //We not use this token currently.
      // The signed-in user info. //var user = result.user;
      sessionInfo('sessioninfo/login', 'logined', ucode, 'POST',
                  {action: 'logined', user: result.user.displayName},
                  true, setUser);

      setUser((preState) => ({
        ...preState,
        //logined: true,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        auth: 'gmail',
        token: ucode
      }));
    }).catch((error) => { // Handle Errors here.
      //let errorCode = error.code;
      //let errorMessage = error.message;
      //The email of the user's account used. //let email = error.email;
      //The firebase.auth.AuthCredential type that was used. //let credential = error.credential;
      console.log("Gmail login error: ", error.code, "; ", error.message, " with ", error.email, " and ", error.credential);
      alert("Gmail login error: Sometimes just connection failed, try sign in more times please.");
    })
  }, []);

  return( //onClick={() => {return nulll;}
      <div class={style.signIn}>
            <img alt="Use ODB SSO or Google account to sign in"
             referrerpolicy="no-referrer"
                     class={style.signInImg}
                     src="../../assets/icons/favicon.png"
                     width="128" />
        { user.saveAgree &&
          <div style="display:inline-block;">
            <button class={style.button} onClick={renderRedirect}>ODB</button>
            <button class={style.button}
               onClick={() => renderFirePopup(auth, googleAuthProvider)}>
               Google</button>
          </div>
        }
        { state.popup && state.redirect !== '' &&
          <Popup
            srcurl={state.redirect}
            text='Click "Close Button" to hide popup'
            closePopup={closePopup}
            checkAuth={checkAuth}
          />
        }
      </div>
  );
};
export default SignIn;
