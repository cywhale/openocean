//import { render } from 'preact';
import { useContext, useState, useEffect, useCallback } from 'preact/hooks';
import { UserContext } from "./UserContext"
import Cookies from 'universal-cookie';
import { auth //, googleAuthProvider //, database
       } from '../firebase';
import { nanoid } from 'nanoid';
import SignIn from 'async!./SignIn';
import style from './style_userhandler';
const { odbConfig } = require('./.ssologin.js');

const UserHandler = () => {
  const cookies = new Cookies();
//const history = createBrowserHistory();
  const { user, setUser } = useContext(UserContext);

  const [state, setState] = useState({
    ssostate: '',
    //redirect: '', //move to SignIn
    //popup: false
  });
  const [ucode, setUcode] = useState({
    str: '',
    //expired:
  });
  const ucodelen = 32;

  const cookieOpts = {
    path: "/",
    expires: new Date(2020, 11, 3, 15, 20, 0, 30),
    sameSite: true,
    //secure: true
  };

  const checkcookie = (cookiename, codelen=0) => {
    let uc = cookies.get(cookiename, { doNotParse: true });
    if (uc !== null && uc != undefined) {
      if (uc && uc !== '') {
        if (codelen === undefined || codelen === 0 || (codelen > 0 && uc.length === codelen)) { return (uc); }
      }
    }
    return('');
  };

  const fetchingUcode = (leng=32) => nanoid(leng);

  const initUcode = async () => {
      let uc = checkcookie('ucode', ucodelen);
      if (uc === '') {
        uc = fetchingUcode(ucodelen);
        cookies.set('ucode', uc, cookieOpts);
      }
      await setUcode((preState) => ({
        ...preState,
        str: uc
      }));
      return (uc);
  };

  const OdbAuth = useCallback(async (ucstr) => { //gencode=false
    let ucstrx = ucstr !== undefined? ucstr: ucode.str;
    //if (gencode && ucstrx === '') ucstrx = initUcode();
    const chkurl =  odbConfig.base + odbConfig.check + "?ucode=" + ucstrx;
    await fetch(chkurl)
       .then(res => res.json())
       .then(sso => {
          if (sso) {
            if (sso.username && sso.username !== "") {
              cookies.set('uauth', 'odb', cookieOpts);
              setState((preState) => ({
                ...preState,
                ssostate: '',
              }));

              return(
                setUser((preState) => ({
                  ...preState,
                  logined: true,
                  name: sso.username,
                  photoURL: 'https://ecodata.odb.ntu.edu.tw/pub/icon/favicon_tw.png',
                  auth: 'odb',
                  token: ucstrx
                }))
              );
            }
          }
          cookies.remove('uauth', { path: '/' });
          setState((preState) => ({
              ...preState,
              ssostate: 'ssofail',
          }));

          return(null);
        });
  }, []);

  const SignOut = () => {
    if (user.auth === 'gmail') { auth.signOut() };
    cookies.remove('ucode', { path: '/' });
    cookies.remove('uauth', { path: '/' });
    setUcode((preState) => ({
      ...preState,
      str: ''
    }));
    setUser((preState) => ({
      ...preState,
      logined: false,
      name: '',
      auth: '',
      photoURL: '',
      token: ''
    }));
    setState((preState) => ({
      ...preState,
      ssostate: '',
      //redirect: '',
      //popup: false
    }));
  };

  const CurrUser = () => {
    return (<article class={style.currentUser}>
         <img alt={user.name}
         referrerpolicy="no-referrer"
                     class={style.avatar}
                     src={user.photoURL}
                     width="60" />
            <button class={style.button} onClick={SignOut}>Sign Out</button>
        </article>
    );
  };

  useEffect(() => {
    const waitFireAuth = (ucstr) => {auth.onAuthStateChanged(
          currUser => {
            if (currUser) {
              cookies.set('uauth', 'gmail', cookieOpts);
              return(
                setUser((preState) => ({
                  ...preState,
                  logined: true,
                  name: currUser.displayName,
                  photoURL: currUser.photoURL,
                  auth: 'gmail',
                  token: ucstr
                }))
              );
            }
            cookies.remove('uauth', { path: '/' });
            return(null);
          }
    )};

    let uc = ucode.str;
    if (uc === '') {
      uc = initUcode();
    } else {
      const last_auth = checkcookie('uauth');
      if (user.auth === 'odb' || (state.ssostate != 'ssofail' && // first check ODB SSO fail or success
          (last_auth === '' || last_auth === 'odb'))) {
        OdbAuth(uc);//uc, false
      } else {
        waitFireAuth(uc);;
      }
      setUser((preState) => ({
        ...preState,
        init: true
      }));
    }
  }, [ucode.str, user.auth, state.ssostate, OdbAuth]);

  // handleSSOChange={OdbAuth()} in prop cause SignIn recusively update? and continuouly get sso?ucode=...
  return (
    <section class={style.flex}>
      { user.name === '' &&
        <div>
        <SignIn ucode={ucode.str} rurl={odbConfig.base + odbConfig.login} />
        </div>
      }
      { user.name !== '' && <div style="display:flex">
        <CurrUser /></div>
      }
     </section>
  );
};
export default UserHandler;
