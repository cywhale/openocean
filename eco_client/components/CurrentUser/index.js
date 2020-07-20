import { Component } from 'preact';
import { auth } from '../firebase';
import style from './style';

export default class CurrentUser extends Component {
  constructor() {
    super();
  }

  render() {
    const user = this.props.user;
    return (<article class={style.currentUser}>
        <img alt={user.displayName} 
        referrerpolicy="no-referrer" 
		    class={style.avatar} 
		    src={user.photoURL} 
		    width="128"	/>
	      <button onClick={() => auth.signOut()}>Sign Out</button>
	    </article>
    );
  }
}
