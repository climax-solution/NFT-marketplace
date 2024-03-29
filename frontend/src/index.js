import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import SimpleReactLightbox from 'simple-react-lightbox'
import "./assets/animated.css";

import './assets/style.scss';
import App from './components/app';
import * as serviceWorker from './serviceWorker';
import store from './store';

ReactDOM.render(
	<React.Fragment>
		<Provider store={store}>
			<SimpleReactLightbox>
				<App/>
			</SimpleReactLightbox>
		</Provider>
	</React.Fragment>,
	document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();