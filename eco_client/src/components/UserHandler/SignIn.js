//import { Component } from 'preact';
//import { auth, googleAuthProvider } from '../firebase';
import style from './style_signin';

const SignIn = () => { //class SignIn extends Component {
  //constructor() {
  //  super();
  //}
  //render() {
  // onClick={() => auth.signInWithRedirect(googleAuthProvider)}
    return ( <div class={style.signIn}>
	    <img alt="Use google account to sign in" 
             referrerpolicy="no-referrer" 
		     class={style.signInImg} 
		     src="../../assets/icons/favicon.png" 
		     width="128" />
	    <button onClick={() => {return nulll;}}>
             Sign In</button>
	    </div>
    );
  //}
}
export default SignIn;
