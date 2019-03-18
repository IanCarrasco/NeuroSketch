import React, { Component } from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import ThreeScene from './App.js';
import Relax from './relax.js'
export default class Container extends Component {
	render() {
		return (
			<BrowserRouter>
				<Route exact path='/home/:att' component={ThreeScene}/>
				<Route exact path='/relax' component={Relax}/>
			</BrowserRouter>
		)
	}
}
