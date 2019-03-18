import React, { Component } from 'react';
import * as THREE from 'three';
import * as TWEEN from 'tween';
import OrbitControls from 'orbit-controls-es6';
import openSocket from 'socket.io-client';
import EtchASketch from './etchasketch.png'
import {Link} from 'react-router-dom'
import './App.css'

class ThreeScene extends Component{
  constructor(props){
    super(props)
    console.log(props);
    this.state = {eeg:null, blink:'Y', drawing:0, threshold:parseInt(props.match.params.att)}
    this.socket = openSocket('http://localhost:8000');
    this.blink_socket = openSocket('http://localhost:8001')
    this.subscribe()
  }
  componentDidMount = () =>{
    const width = 684;
    const height = 480;

    //ADD SCENE
    this.scene = new THREE.Scene()

    //Initialize Variables
    this.scale_counter = 1;
    this.xOn = 0;
    this.yOn = 1;
    this.zOn = 0;
    this.up = 1;
    this.down = 0;
    this.list = [[0,0,0], [0,1,0]];
    this.cameraX = 10;
		this.cameraY = 15;
		this.cameraZ = 20;

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set( this.cameraX, this.cameraY, this.cameraZ );
    this.controls = new OrbitControls( this.camera );
    this.controls.autoRotate = true

    this.scene.background = new THREE.Color(0x242E46);

    this.axesHelper = new THREE.AxesHelper( 2 );
    this.scene.add( this.axesHelper );


    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setClearColor('#000000')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    // line material properties
    this.material = new THREE.LineBasicMaterial({
    color: 0xF0503D,
    linewidth: 6
    });

    // create starting line
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(
     new THREE.Vector3( 0, 0, 0 ),
     new THREE.Vector3( 0, 1, 0 )
    );

    this.line = new THREE.Line( this.geometry, this.material );
    this.scene.add( this.line )

    // add an arrow (blue cone)
    this.dir = new THREE.Vector3( 0, 2, 0 );
    this.dir.normalize();
    this.origin = new THREE.Vector3( 0, 1, 0 );
    this.length = 0.5;
    this.hex = 0x26BED3;
    this.headLength = .75;
    this.headWidth = 1.25;
    this.arrowHelper = new THREE.ArrowHelper( this.dir, this.origin, this.length, this.hex, this.headLength, this.headWidth );
    
    this.scene.add( this.arrowHelper );

    this.start()
  }
  componentWillUnmount = () =>{
      this.stop()
      this.mount.removeChild(this.renderer.domElement)
    }
  start = () => {
      if (!this.frameId) {
        this.frameId = requestAnimationFrame(this.animate)
      }

  }
  createLine = () =>{

    // create new line holding previous line's position and dimension
    this.geometry2 = new THREE.Geometry();
    this.geometry2.vertices.push(
     new THREE.Vector3( this.line.geometry.vertices[ 0 ].x, this.line.geometry.vertices[ 0 ].y, this.line.geometry.vertices[ 0 ].z ),
     new THREE.Vector3( this.line.geometry.vertices[ 1 ].x, this.line.geometry.vertices[ 1 ].y, this.line.geometry.vertices[ 1 ].z )
    );

    this.line2 = new THREE.Line( this.geometry2, this.material );
    this.scene.add( this.line2 );
    this.line.verticesNeedUpdate = true;

  }
  checkList = () => {
    for (let i = 0; i < this.list.length - 1; i++) {
      var name = "" + this.list[i];
      var name2 = "" + [this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z];
      if (name.localeCompare(name2) == 0) {
        this.createPlane();
      }
    }
  }
  createPlane = () => {
    this.xSum = 0;
    this.ySum = 0;
    this.zSum = 0;
    this.yellow = new THREE.Color( 0xffff00 );
    this.blue = new THREE.Color(0x4169E1);
    this.red = new THREE.Color(0xFF0000);
    this.colorList = [this.yellow, this.blue, this.red];
    this.listLen = this.list.length - 1; // Subtract one since one vertex is overlapping
    this.geometry10= new THREE.Geometry();

    // create vertices
    for (let i = 0; i < this.list.length; i++) {
      this.geometry10.vertices.push( new THREE.Vector3(this.list[i][0], this.list[i][1], this.list[i][2]));
      this.xSum += this.list[i][0];
      this.ySum += this.list[i][1];
      this.zSum += this.list[i][2];
    }

    // create centroid vertix
    this.geometry10.vertices.push( new THREE.Vector3(this.xSum / this.listLen, this.ySum / this.listLen, this.zSum / this.listLen ));

    // create faces. Cannot directly fill in closed spaces. threejs shapes are made up of multiple triangles
    for (let i = 0; i < this.listLen; i++) {
      this.geometry10.faces.push( new THREE.Face3(i, i + 1, this.listLen));
    }

    // material's color is randomly chosen to be one of three mondrianesque colors
    this.material10 = new THREE.MeshBasicMaterial( {color: this.colorList[Math.floor(Math.random()*3)], side: THREE.DoubleSide, opacity: .60, transparent: true} );
    this.plane10 = new THREE.Mesh( this.geometry10, this.material10 );
    this.scene.add(this.plane10);

    // reset list
    this.list = [this.list[this.listLen]];

  }
  stop = () => {
      cancelAnimationFrame(this.frameId)
    }
  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  countBlinks = (arr) => {
    let blinks = 0;
    for( let i = 0; i < arr.length; i++){

      if(arr[i] > 80){

        blinks++;

      }
    }
    return blinks
  }
  subscribe = () =>{
    this.socket.emit('getEEG', 0);

    this.socket.on('eeg', sig => {
      this.setState({eeg:sig})
      this.artist()
    
    })

    let blink_store = []
    this.blink_socket.emit('getBlink', 0);
    this.blink_socket.on('blink', sig => {
      blink_store.push(sig.blinkStrength)
      console.log(blink_store)
      if(blink_store.length == 3){
        console.log(blink_store)


        let blinks = this.countBlinks(blink_store)
        console.log(blinks)

        switch(this.state.blink){

          case 'X':
            this.setState({blink:'Y'})
            break;
          case 'Y':
            this.setState({blink:'Z'})
            break;
          case 'Z':
            this.setState({blink:'X'})
            
        }


      

        //Blink Mag Scheme
        // if(blinks > 3){

        //   this.setState({blink:'Z'})

        // }else if(blinks >=2){

        //   this.setState({blink:'X'})

        // }else if(blinks >= 1){

        //   this.setState({blink:'Y'})

        // }
        blink_store = []
      }

    })
  }

  


  artist = () => {
    console.log(this.state.blink)
    switch(this.state.blink){

      case 'Y':
        this.xOn = 0;
        this.yOn = 1;
        this.zOn = 0;
        break;
      case 'X':
        this.xOn = 1;
        this.yOn = 0;
        this.zOn = 0;
        break;
      case 'Z':
        this.xOn = 1;
        this.yOn = 0;
        this.zOn = 0;
        break;

    }
    if((this.state.eeg.eSense.attention > this.state.threshold - 10) && this.state.blink=='Y'){

      this.createLine();
      this.scale_counter = 1;

      this.line.geometry.vertices[ 0 ].z = this.line.geometry.vertices[1].z;
      this.line.geometry.vertices[ 0 ].y = this.line.geometry.vertices[1].y;
      this.line.geometry.vertices[ 0 ].x = this.line.geometry.vertices[1].x;

      // move line forward (up == 1) or backwards (else)
      if (this.up == 1) {
        // technically does not increase perceived line length or scale. Just streches vertex of current line by one and once only
        this.cameraY += 1

        this.line.geometry.vertices[ 1 ].y += this.scale_counter;
        this.list.push([this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z]);


        // moves arrow to position of new line. Yeah, combining the objects would have been easier
        this.newDir = new THREE.Vector3( this.line.geometry.vertices[1].x, this.line.geometry.vertices[1].y + 10000000000, this.line.geometry.vertices[1].z );
        this.arrowHelper.setDirection(this.newDir.normalize());
        this.arrowHelper.position.set(this.line.geometry.vertices[1].x,this.line.geometry.vertices[1].y,this.line.geometry.vertices[1].z);
        // explained above. Will call createPlane if there are matching list elements
        this.checkList();

      } else {

        this.cameraY -= 1


        this.line.geometry.vertices[ 1 ].y -= this.scale_counter;
        this.list.push([this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z]);

        this.newDir = new THREE.Vector3( this.line.geometry.vertices[1].x, this.line.geometry.vertices[1].y - 10000000000, this.line.geometry.vertices[1].z );
        this.arrowHelper.setDirection(this.newDir.normalize());
        this.arrowHelper.position.set(this.line.geometry.vertices[1].x,this.line.geometry.vertices[1].y,this.line.geometry.vertices[1].z);

        this.checkList();
      }
    }
    else if ((this.state.eeg.eSense.attention > this.state.threshold - 10) && this.state.blink=='Z') {
        console.log('asdfhashdfhasdhf')
        this.createLine();
        this.scale_counter = 1;

        this.line.geometry.vertices[ 0 ].z = this.line.geometry.vertices[1].z;
        this.line.geometry.vertices[ 0 ].y = this.line.geometry.vertices[1].y;
        this.line.geometry.vertices[ 0 ].x = this.line.geometry.vertices[1].x;

        if (this.up == 1) {
          this.cameraZ += 1

          this.line.geometry.vertices[ 1 ].z += this.scale_counter;
          this.list.push([this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z]);

          this.newDir = new THREE.Vector3( this.line.geometry.vertices[1].x, this.line.geometry.vertices[1].y, this.line.geometry.vertices[1].z + 10000000000);
          this.arrowHelper.setDirection(this.newDir.normalize());
          this.arrowHelper.position.set(this.line.geometry.vertices[1].x,this.line.geometry.vertices[1].y,this.line.geometry.vertices[1].z);

          this.checkList();

        } else {

          this.cameraZ -= 1

          this.line.geometry.vertices[ 1 ].z -= this.scale_counter;
          this.list.push([this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z]);

          this.newDir = new THREE.Vector3( this.line.geometry.vertices[1].x, this.line.geometry.vertices[1].y, this.line.geometry.vertices[1].z - 10000000000);
          this.arrowHelper.setDirection(this.newDir.normalize());
          this.arrowHelper.position.set(this.line.geometry.vertices[1].x,this.line.geometry.vertices[1].y,this.line.geometry.vertices[1].z);

          this.checkList();

        }

        // if key S is pressed move in the x direction
      } 
      else if ((this.state.eeg.eSense.attention > this.state.threshold - 10) && this.state.blink=='X') {
        this.xOn = 1;
        this.yOn = 0;
        this.zOn = 0;

        this.createLine();
        this.scale_counter = 1;

        this.line.geometry.vertices[ 0 ].z = this.line.geometry.vertices[1].z;
        this.line.geometry.vertices[ 0 ].y = this.line.geometry.vertices[1].y;
        this.line.geometry.vertices[ 0 ].x = this.line.geometry.vertices[1].x;

        if (this.up == 1) {
          this.cameraX += 1

          this.line.geometry.vertices[ 1 ].x += this.scale_counter;
          this.list.push([this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z]);

          this.newDir = new THREE.Vector3( this.line.geometry.vertices[1].x + 10000000000, this.line.geometry.vertices[1].y, this.line.geometry.vertices[1].z );
          this.arrowHelper.setDirection(this.newDir.normalize());
          this.arrowHelper.position.set(this.line.geometry.vertices[1].x,this.line.geometry.vertices[1].y,this.line.geometry.vertices[1].z);

          this.checkList();
        } else {
          this.cameraX -= 1

          this.line.geometry.vertices[ 1 ].x -= this.scale_counter;
          this.list.push([this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z]);

          this.newDir = new THREE.Vector3( this.line.geometry.vertices[1].x - 10000000000, this.line.geometry.vertices[1].y, this.line.geometry.vertices[1].z );
          this.arrowHelper.setDirection(this.newDir.normalize());
          this.arrowHelper.position.set(this.line.geometry.vertices[1].x,this.line.geometry.vertices[1].y,this.line.geometry.vertices[1].z);

          this.checkList();
        }
    }
  }
  handleKeyDown = (e) => {
    console.log(e);
    if(e.key == 'u'){

      this.up = 0

    }


  }
  animate = () => {
    this.camera.lookAt(this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z)
    this.controls.target.set(this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z)
    this.axesHelper.position.set(this.line.geometry.vertices[ 1 ].x,this.line.geometry.vertices[ 1 ].y,this.line.geometry.vertices[ 1 ].z)


    this.frameId = window.requestAnimationFrame(this.animate)
    this.renderScene()


    this.scene.updateMatrixWorld();
    this.controls.update()
    this.geometry.verticesNeedUpdate = true;
  }
  render = () =>{
      return(
        <div className="main-window" onKeyDown={(e) => this.handleKeyDown(e)} tabIndex="0">

        <React.Fragment>
          <img src={EtchASketch} className="sketcha"/>
          <h1 style={{fontSize:'3rem'}} className="title-header">Neuro<br/>Sketch</h1>
          <Link to="/relax"><button className="calibrate">CALIBRATE</button></Link>
          <br></br>
          <h2 className="title-header">Statistics</h2>
          {/* <h2>Attention Threshold: {this.props.location.state.attSum/this.props.location.state.attTotal}</h2> */}
          <h2 className="title-header-1">Attention:{this.state.eeg ? this.state.eeg.eSense.attention : 0 }</h2>
          <h2 className="title-header-1">Current Axis:{this.state.blink}</h2>
          <div
            className="container"
            ref={(mount) => { this.mount = mount }}
          />
        </React.Fragment>

        </div>
      )
  }
}
export default ThreeScene