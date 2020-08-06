//import { Component } from 'preact';
import { useState, useEffect } from 'preact/hooks';
//import { auth //, database
//       } from './firebase';
import CurrentUser from './CurrentUser';
import SignIn from './SignIn';
import style from './style_userhandler';
/*
const handleAuth = (auth) => {
    const [currUser, setCurrUser] = useState(null);

    useEffect(() => {
       const waitAuth = auth.onAuthStateChanged(
          currUser => {currUser? setCurrUser(currUser): setCurrUser(null); }
       );
       return () => { waitAuth(); }
    });
    return currUser
}
*/
const UserHandler = () => { //class UserHandler extends Component {
  //render() {
    const currUser = null; //handleAuth(auth);
    return (
    	<section class={style.flex}>
  	    {!currUser && <SignIn />}
	    {currUser &&  <div class={style.flex}>
	        <CurrentUser user={currUser} /></div>}
	</section>
    );
  //}
}
export default UserHandler;
