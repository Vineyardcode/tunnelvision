import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.z = 100;

const scene = new THREE.Scene();

let points = [
  [68.5,185.5],
  [1,262.5],
  [270.9,281.9],
  [345.5,212.8],
  [178,155.7],
  [240.3,72.3],
  [153.4,0.6],
  [52.6,53.3],
  [68.5,185.5]
];

for (let i = 0; i < points.length; i++) {
  let x = points[i][0];
  let y = 0;
  let z = points[i][1];
  points[i] = new THREE.Vector3(x, y, z);
}

const path = new THREE.CatmullRomCurve3(points);
const tunnelGeometry = new THREE.TubeGeometry( path, 300, 2, 20, true );
const tunnelMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );




const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const cube = new THREE.Mesh( geometry, material );
const tunnel = new THREE.Mesh( tunnelGeometry, material );
// scene.add( cube );
scene.add( tunnel );


const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);






















// animation

function animation() {



	renderer.render( scene, camera );
  controls.update();
}