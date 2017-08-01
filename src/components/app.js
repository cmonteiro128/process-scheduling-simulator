import { h, Component } from 'preact';

import Header from './header';
import Home from '../routes/home';
//import Home from 'async!../routes/home';

import 'preact-material-components/Typography/style.css';

export default class App extends Component {
	render() {
		return (
			<div id="app">
				<Header />
				<Home />
			</div>
		);
	}
}
