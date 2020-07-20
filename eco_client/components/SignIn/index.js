import { Component } from 'preact';
import { auth, googleAuthProvider } from '../firebase';
import style from './style';

export default class SignIn extends Component {
  constructor() {
	super();
  }
	
  render() {
    return ( <div class={style.signIn}>
	    <img alt="Use google account to sign in" 
             referrerpolicy="no-referrer" 
		     class={style.signInImg} 
		     src="../../assets/icons/favicon.png" 
		     width="128" />
	    <button onClick={() => auth.signInWithRedirect(googleAuthProvider)}>
             Sign In</button>
	    </div>
    );
  }
}
