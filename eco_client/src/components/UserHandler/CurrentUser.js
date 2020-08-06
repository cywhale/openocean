//import { Component } from 'preact';
//import { auth } from '../firebase';
import style from './style_curruser';

const CurrentUser = (props) => { //class CurrentUser extends Component {
  //constructor() {
  //  super();
  //}

  //render() {
  // onClick={() => auth.signOut()}
    //const user = this.props.user;
    const {user} = props;
    return (<article class={style.currentUser}>
        <img alt={user.displayName} 
        referrerpolicy="no-referrer" 
		    class={style.avatar} 
		    src={user.photoURL} 
		    width="128"	/>
	      <button onClick={() => {return null;}}>Sign Out</button>
	    </article>
    );
  //}
};
export default CurrentUser;
