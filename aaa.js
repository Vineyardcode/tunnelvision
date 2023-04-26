import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 1;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
light.castShadow = true;
scene.add(light);

const scene = new THREE.Scene();

let points = [
  [0, 2],
  [2, 10],
  [-1, 15],
  [-3, 20],
  [0, 25]
];

//Convert the array of points into vertices
for (let i = 0; i < points.length; i++) {
  let x = points[i][0];
  let y = 0;
  let z = points[i][1];
  points[i] = new THREE.Vector3(x, y, z);
}
//Create a path from the points
const path = new THREE.CatmullRomCurve3(points);

//Create the tube geometry from the path
const geometry = new THREE.TubeGeometry( path, 64, 2, 8, false );
//Basic material
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
//Create a mesh
const tube = new THREE.Mesh( geometry, material );
//Add tube into the scene
scene.add( tube );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);


function animation( time ) {



	renderer.render( scene, camera );
  controls.update();
}