import React, { Component } from 'react'
import './App.css'
import openSocket from 'socket.io-client';
import {Redirect} from 'react-router-dom'
import Anim from './tumblr_nm6onkRltD1u8rtwro3_400.gif'


export default class Relax extends Component {
	constructor(){

		super()
		let string = "There will now be a series of 5 math problems."
		this.state = {time:10, relax: true, redirect:false, problem:string, eeg:null, relaxSum:0, relaxTotal:0, attSum:0, attTotal:0, hidden:'hidden', uiHide:''}
    this.socket = openSocket('http://localhost:8000');

	}
	handleClick = () =>{
		this.socket.emit('getEEG', 0);
    this.socket.on('eeg', sig => {
			console.log(sig)

			this.setState({relaxSum: this.state.relaxSum + sig.eSense.attention})
			this.setState({relaxTotal: this.state.relaxTotal + 1})
			this.setState({eeg:sig})
	
		})
		let timer = setInterval(() => {
			
			if(this.state.time > 0){
				this.setState({time: --this.state.time})
			
			}else{

				this.setState({relax:false})


			}
		}, 1000)

		if(this.state.time <= 0){

			clearInterval(timer)

		}
	}
	handleAttClick = () =>{

		this.setState({hidden:''})
		this.setState({uiHide:'hidden'})

		this.socket.emit('getEEG', 0);
    this.socket.on('eeg', sig => {

			this.setState({attSum: this.state.relaxSum + sig.eSense.attention})
			this.setState({attTotal: this.state.relaxTotal + 1})
			this.setState({eeg:sig})
	
		})

		console.log(this.state)
		
		this.setState({time:10})

		let timer = setInterval(() => {
			
			if(this.state.time > 0){
				this.setState({time: --this.state.time})
			
			}else{

				this.setState({redirect:true})


			}
		}, 1000)

	}
	
	render() {
		{

			if(this.state.redirect){
				return(
				<Redirect to={{
										pathname: `/home/${Math.floor(this.state.attSum/this.state.attTotal)}`,
										state: {...this.state}
								}}
				/>)
			}

			if(this.state.relax){
				return(
					<div className="relax-page">
						<h1 className="timer">{this.state.time == 1 ? `Relax for ${this.state.time}s...` : `Relax for ${this.state.time}s...`}</h1>
						<button className="start-button" onClick={this.handleClick}>Start</button>
					</div>
				)
			}
			else{
				return(
					<div className="relax-page">
						<h1 className={`timer ${this.state.uiHide}`}>Focus on the center of the following animation</h1>
						<button className={`start-button ${this.state.uiHide}`} onClick={this.handleAttClick}>Start</button>
						<img className={`focus-animation ${this.state.hidden}`} src={Anim}></img>
					</div>
				)
			}
		}
	}
}
