//https://www.codegrepper.com/code-examples/javascript/react+multiple+context+providers
//https://www.pluralsight.com/guides/how-to-use-react-context-to-share-data-between-components
import { useState } from 'preact/hooks'
import { createContext } from 'preact';
//import { gen_ucode } from 'async!../Compo/gen_ucode';

const UserContext = createContext();
const UserContextProvider = (props) => {//,...children
/*const ucode_opts = {
    uname: 'ucode',
    ucodeleng: 32,
    ucookie_opts: {
      path: "/",
      expires: new Date(2020, 11, 3, 15, 20, 0, 30),
      //secure: true
    }
  };*/
  const [user, setUser] = useState({
    init: false,
    logined: false,
    name: '',
    auth: '', //odb, gmail
    photoURL: '',
    token: '' //gen_ucode({uname: 'ucode'})
  });

  //{{...children}}
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
};
export { UserContext, UserContextProvider };
