import { h, Component } from 'preact';
import Sidebar from '../../components/Sidebar';
import style from './style';

export default class Home extends Component {
	render() {
		return (
			<div class={style.home}>
				<Sidebar />
			</div>
		);
	}
}
