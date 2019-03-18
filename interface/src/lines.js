<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<title>Etch Sketch - label</title>
		<style>
			body {
				background-color: #FFF;
				margin: 0;
				overflow: hidden;
			}
			#info {
				position: absolute;
				top: 0px;
				width: 100%;
				color: #FFF;
				padding: 5px;
				font-family: Monospace;
				font-size: 13px;
				text-align: center;
				z-index: 1;
			}

			.label{
				color: #FFF;
				font-family: sans-serif;
				padding: 2px;
				background: rgba( 0, 0, 0, .6 );
			}

			a {
				color: #ffffff;
			}

    </style>
	  </head>
	  <body>

		<script src="js/three.js"></script>

		<script src="js/OrbitControls.js"></script>

		<script src="js/CSS2DRenderer.js"></script>


		<script>

    var camera, scene, renderer, labelRenderer;
		var clock = new THREE.Clock();
	  var textureLoader = new THREE.TextureLoader();
    var scale_counter = 1;
    var xOn = 0;
    var yOn = 1;
    var zOn = 0;
    var up = 1;
    var down = 0;
    var list = [[0,0,0], [0,1,0]];





    init();
    //animate();
    //animate();
    //onDocumentKeyDown(event);

    function init() {


      camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
      camera.position.set( 10, 15, 20 );

      var controls = new THREE.OrbitControls( camera );

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xD3D3D3)  //( 0xf0f0f0 );


      var axesHelper = new THREE.AxesHelper( 10 );
      scene.add( axesHelper );


      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );

      // line material properties
      var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 6
      });



      // create line
      var geometry = new THREE.Geometry();
      geometry.vertices.push(
       new THREE.Vector3( 0, 0, 0 ),
       new THREE.Vector3( 0, 1, 0 )
      );
      var line = new THREE.Line( geometry, material );
      scene.add( line )




      var dir = new THREE.Vector3( 0, 2, 0 );
      dir.normalize();
      var origin = new THREE.Vector3( 0, 1, 0 );
      var length = 0.5;
      var hex = 0x26BED3;
      var headLength = .75;
      var headWidth = 1.25;
      var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, headLength, headWidth );
      scene.add( arrowHelper );




      /*THREE.GeometryUtils.merge(cone,line);
      var mesh = new Three.Mesh(cone);
      mesh.position.set(1,1,1);
      scene.add(mesh);

      var sphere = new THREE.Mesh( new THREE.ConeGeometry(0.5,16,12),new THREE.MeshBasicMaterial( { color: 0x2D303D, wireframe: false} ));
            var  cyn = new THREE.Mesh(new THREE.CylinderGeometry(100, 100, 200, 16, 4, false ),new THREE.MeshLambertMaterial( { color: 0x2D303D, wireframe: false} ));
                cyn.position.y = -100;
                scene.add(sphere);
                scene.add(cyn);
      */




      function createLine() {

        //create new line holding previous line's position and dimension
        var geometry2 = new THREE.Geometry();
        geometry2.vertices.push(
         new THREE.Vector3( line.geometry.vertices[ 0 ].x, line.geometry.vertices[ 0 ].y, line.geometry.vertices[ 0 ].z ),
         new THREE.Vector3( line.geometry.vertices[ 1 ].x, line.geometry.vertices[ 1 ].y, line.geometry.vertices[ 1 ].z )
        );

        var line2 = new THREE.Line( geometry2, material );
        scene.add( line2 );
        line.verticesNeedUpdate = true;


			}



      document.addEventListener("keydown", onDocumentKeyDown, false);
      function onDocumentKeyDown(event) {
        var keyCode = event.which;

        // if key W is pressed move a step of length 1 in the y direction by creating lines of length one
        if (keyCode == 87) {
          xOn = 0;
          yOn = 1;
          zOn = 0;

          createLine();
          scale_counter = 1;

          line.geometry.vertices[ 0 ].z = line.geometry.vertices[1].z;
          line.geometry.vertices[ 0 ].y = line.geometry.vertices[1].y;
          line.geometry.vertices[ 0 ].x = line.geometry.vertices[1].x;

          // move line forward or backwards
          if (up == 1) {

            line.geometry.vertices[ 1 ].y += scale_counter;
            list.push([line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z]);

            newDir = new THREE.Vector3( line.geometry.vertices[1].x, line.geometry.vertices[1].y + 10000000000, line.geometry.vertices[1].z );
            arrowHelper.setDirection(newDir.normalize());
            arrowHelper.position.set(line.geometry.vertices[1].x,line.geometry.vertices[1].y,line.geometry.vertices[1].z);

            for (let i = 0; i < list.length - 1; i++) {
              var name = "" + list[i];
              var name2 = "" + [line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z];
              if (name.localeCompare(name2) == 0) {
                createPlane();
              }

            }
            line.geometry.verticesNeedUpdate = true;
          } else {
            line.geometry.vertices[ 1 ].y -= scale_counter;
            list.push([line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z]);
            newDir = new THREE.Vector3( line.geometry.vertices[1].x, line.geometry.vertices[1].y - 10000000000, line.geometry.vertices[1].z );
            arrowHelper.setDirection(newDir.normalize());
            arrowHelper.position.set(line.geometry.vertices[1].x,line.geometry.vertices[1].y,line.geometry.vertices[1].z);

            for (let i = 0; i < list.length - 1; i++) {
              var name = "" + list[i];
              var name2 = "" + [line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z];
              if (name.localeCompare(name2) == 0) {
                createPlane();
              }

            }
            line.geometry.verticesNeedUpdate = true;
          }

        // if key A is pressed move in z direction
      } else if (keyCode == 65) {
          xOn = 0;
          yOn = 0;
          zOn = 1;

          createLine();
          scale_counter = 1;

          line.geometry.vertices[ 0 ].z = line.geometry.vertices[1].z;
          line.geometry.vertices[ 0 ].y = line.geometry.vertices[1].y;
          line.geometry.vertices[ 0 ].x = line.geometry.vertices[1].x;

          if (up == 1) {
            line.geometry.vertices[ 1 ].z += scale_counter;
            list.push([line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z]);


            newDir = new THREE.Vector3( line.geometry.vertices[1].x, line.geometry.vertices[1].y, line.geometry.vertices[1].z + 10000000000);
            arrowHelper.setDirection(newDir.normalize());
            arrowHelper.position.set(line.geometry.vertices[1].x,line.geometry.vertices[1].y,line.geometry.vertices[1].z);

            for (let i = 0; i < list.length - 1; i++) {
              var name = "" + list[i];
              var name2 = "" + [line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z];
              if (name.localeCompare(name2) == 0) {
                createPlane();
              }

            }

            line.geometry.verticesNeedUpdate = true;
          } else {
            line.geometry.vertices[ 1 ].z -= scale_counter;
            list.push([line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z]);
            newDir = new THREE.Vector3( line.geometry.vertices[1].x, line.geometry.vertices[1].y, line.geometry.vertices[1].z - 10000000000);
            arrowHelper.setDirection(newDir.normalize());
            arrowHelper.position.set(line.geometry.vertices[1].x,line.geometry.vertices[1].y,line.geometry.vertices[1].z);

            for (let i = 0; i < list.length - 1; i++) {
              var name = "" + list[i];
              var name2 = "" + [line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z];
              if (name.localeCompare(name2) == 0) {
                createPlane();
              }

            }
            line.geometry.verticesNeedUpdate = true;
          }

        // if key S is pressed move in the x direction
      } else if (keyCode == 83) {
          xOn = 1;
          yOn = 0;
          zOn = 0;

          createLine();
          scale_counter = 1;

          line.geometry.vertices[ 0 ].z = line.geometry.vertices[1].z;
          line.geometry.vertices[ 0 ].y = line.geometry.vertices[1].y;
          line.geometry.vertices[ 0 ].x = line.geometry.vertices[1].x;

          if (up == 1) {
            line.geometry.vertices[ 1 ].x += scale_counter;
            list.push([line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z]);

            newDir = new THREE.Vector3( line.geometry.vertices[1].x + 10000000000, line.geometry.vertices[1].y, line.geometry.vertices[1].z );
            arrowHelper.setDirection(newDir.normalize());
            arrowHelper.position.set(line.geometry.vertices[1].x,line.geometry.vertices[1].y,line.geometry.vertices[1].z);

            for (let i = 0; i < list.length - 1; i++) {
              var name = "" + list[i];
              var name2 = "" + [line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z];
              if (name.localeCompare(name2) == 0) {
                createPlane();
              }

            }
            line.geometry.verticesNeedUpdate = true;
          } else {
            line.geometry.vertices[ 1 ].x -= scale_counter;
            list.push([line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z]);
            newDir = new THREE.Vector3( line.geometry.vertices[1].x - 10000000000, line.geometry.vertices[1].y, line.geometry.vertices[1].z );
            arrowHelper.setDirection(newDir.normalize());
            arrowHelper.position.set(line.geometry.vertices[1].x,line.geometry.vertices[1].y,line.geometry.vertices[1].z);

            for (let i = 0; i < list.length - 1; i++) {
              var name = "" + list[i];
              var name2 = "" + [line.geometry.vertices[ 1 ].x,line.geometry.vertices[ 1 ].y,line.geometry.vertices[ 1 ].z];
              if (name.localeCompare(name2) == 0) {
                createPlane();
              }

            }
            line.geometry.verticesNeedUpdate = true;
          }


        /*} else if (keyCode == 71) {
          scale_counter += .08;
          //line.scale.set(scale_counter, scale_counter, scale_counter);
          //vector =  line.geometry.vertices[1];
          if(xOn == 1) {
            line.geometry.vertices[ 1 ].x = scale_counter;
            line.geometry.verticesNeedUpdate = true;
          } else if (yOn == 1) {
            line.geometry.vertices[ 1 ].y = scale_counter;
            line.geometry.verticesNeedUpdate = true;
          } else if (zOn == 1) {
            line.geometry.vertices[ 1 ].z = scale_counter;
            line.geometry.verticesNeedUpdate = true;
          }
          */
        } else if (keyCode == 85) {
          up = Math.abs(up - 1);
          down = Math.abs(down - 1);
            //

            //var dir = new THREE.Vector3( 0, 2, 0 );
            //dir.normalize();
            //var origin = new THREE.Vector3( 0, 1, 0 );

            /*
            if(((line.geometry.vertices[ 0 ].x  - line.geometry.vertices[1].x ) - (line.geometry.vertices[ 0 ].z  - line.geometry.vertices[1].z )) == 0) {
              cone.rotation.z = Math.PI;
            } else if (((line.geometry.vertices[ 0 ].y  - line.geometry.vertices[1].y ) - (line.geometry.vertices[ 0 ].z  - line.geometry.vertices[1].z )) == 0) {
              cone.rotation.y = Math.PI;
            } else if (((line.geometry.vertices[ 0 ].x  - line.geometry.vertices[1].x ) - (line.geometry.vertices[ 0 ].y  - line.geometry.vertices[1].y )) == 0) {
              cone.rotation.x = Math.PI;
            }
            */




          }
        //render();
        }

        function createPlane() {
          var xSum = 0;
          var ySum = 0;
          var zSum = 0;
          var yellow = new THREE.Color( 0xffff00 );
          var blue = new THREE.Color(0x4169E1);
          var red = new THREE.Color(0xFF0000);
          var colorList = [yellow, blue, red];
          var listLen = list.length - 1; // Subtract one since one vertex is overlapping
          var geometry10= new THREE.Geometry();

          // create vertices
          for (let i = 0; i < list.length; i++) {
            geometry10.vertices.push( new THREE.Vector3(list[i][0], list[i][1], list[i][2]));
            xSum += list[i][0];
            ySum += list[i][1];
            zSum += list[i][2];
          }

          // create centroid vertix
          geometry10.vertices.push( new THREE.Vector3(xSum / listLen, ySum / listLen, zSum / listLen ));

          // create faces
          for (let i = 0; i < listLen; i++) {
            geometry10.faces.push( new THREE.Face3(i, i + 1, listLen));
          }

          var material10 = new THREE.MeshBasicMaterial( {color: colorList[Math.floor(Math.random()*3)], side: THREE.DoubleSide, opacity: .60, transparent: true} );
          var plane10 = new THREE.Mesh( geometry10, material10 );
          scene.add(plane10);

          // reset list
          list =  [list[listLen]];

        }



        function animate() {

				      requestAnimationFrame( animate );
				      var elapsed = clock.getElapsedTime();
				      renderer.render( scene, camera );
              scene.updateMatrixWorld();
              geometry.verticesNeedUpdate = true;

		}

      animate();
      onDocumentKeyDown(event);
    }

    </script>
  </body>
</html>