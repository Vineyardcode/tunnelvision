import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.001, 1000 );

// camera.position.set(16.884321509584424,13.750701663231013, 266.46567118999934 )

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
  let y = 0
  let z = points[i][1];
  points[i] = new THREE.Vector3(x, y, z);
}



const path = new THREE.CatmullRomCurve3(points);
const tunnelGeometry = new THREE.TubeGeometry( path, 300, 2, 20, true );



const light = new THREE.PointLight(0xffffff, 1, 20);
light.castShadow = true;
scene.add(light);

const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 )

const torusGeometry = new THREE.TorusGeometry( 15, 3, 4, 4 )
const material = new  THREE.MeshNormalMaterial( { 
  side : THREE.BackSide,
  wireframe: false, 
  flatShading: true,
} );	
const torusMaterial = new  THREE.MeshNormalMaterial( { 
  side : THREE.BackSide,
  transparent: true,
  flatShading: true,
  opacity: 0.9,
} );	
const cubeMaterial = new  THREE.MeshNormalMaterial( { 
  side : THREE.BackSide,
  wireframe: false, 
  flatShading: true
} );	

const torus = new THREE.Mesh( torusGeometry, torusMaterial );
const tunnel = new THREE.Mesh( tunnelGeometry, material );

scene.add( torus );
scene.add( tunnel );



const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop( animation );

const controls = new OrbitControls(camera, renderer.domElement);





const size = 1;

// Define the geometry for the cube
const geometry = new THREE.BoxGeometry(size, size, size);

// Define the material for the cube
const materiall = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.5, side: THREE.BackSide, flatShading: true });

// Create the mesh object and add it to the scene
const cube = new THREE.Mesh(geometry, materiall);

scene.add( cube );



let isAudioContextStarted = false

let audioContext = new AudioContext();
function startAudioContext() {
  if (!isAudioContextStarted) {
    isAudioContextStarted = true;
    audioContext.resume().then(() => {
      console.log('AudioContext started');
    });
  }
}

document.addEventListener('click', startAudioContext);
document.addEventListener('touchstart', startAudioContext);

// virtual cable {deviceId: 'VBAudioVACWDM'}

function getSound(callback) {
  
  navigator.mediaDevices.getUserMedia({audio: {deviceId: 'VBAudioVACWDM'}})
    .then(stream => {
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const timeDomainData = new Uint8Array(analyser.frequencyBinCount);
      function updateAmplitude() {
        analyser.getByteTimeDomainData(timeDomainData);
        let amplitude = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          const sample = timeDomainData[i] / 128 - 1;
          amplitude += sample * sample;
        }
        amplitude = Math.sqrt(amplitude / timeDomainData.length);
        callback(amplitude);
        requestAnimationFrame(updateAmplitude);
      }
      updateAmplitude();
    })
    .catch(error => {
      console.error(error);
    });
}

let amplitude = 0;

getSound(newAmplitude => {
  amplitude = newAmplitude;
});

let percentage = 0


let torusScale = 0.1

  torus.scale.set(torusScale, torusScale, torusScale)


let rotation = 0
const maxRotation = 15;
let increment = true;

function easeOut(ratio) {
  return 1 - Math.pow(1 - ratio, 3);
}


function animation() {
  percentage += 0.0000007;

  let p1 = path.getPointAt(percentage%1);
  let p2 = path.getPointAt((percentage + 0.01)%1);
  let p3 = path.getPointAt((percentage + 0.017)%1);
  let p5 = path.getPointAt((percentage + 0.02)%1);
  
  let tubeTangent = path.getTangentAt(percentage%1);
  torus.position.copy(p3);
  torus.lookAt(p3.clone().add(tubeTangent));

  cube.position.copy(p3);
  cube.lookAt(p3.clone().add(tubeTangent));

  if (increment) {
    rotation += 0.0001;
    if (rotation >= maxRotation) {
      increment = false;
    }
  } else {
    rotation -= 0.0001;
    if (rotation <= 0) {
      increment = true;
    }
  }


  let ratio = rotation / maxRotation;
  let easedRatio = easeOut(ratio);
  let rotationRadians = easedRatio * Math.PI * 2;

  torus.rotation.z = rotationRadians;
  cube.rotation.x = rotationRadians*(-2);
  cube.rotation.y = rotationRadians*(-3);
  cube.rotation.z = rotationRadians*(-1);
  cube.scale.set(1.2,1.2,amplitude*2+0.1)


  light.position.set(p2.x, p2.y, p2.z);
  camera.position.set(p1.x,p1.y,p1.z);
  camera.lookAt(p2);

  renderer.render(scene, camera);
  controls.update();
  
  requestAnimationFrame(animation);

}

requestAnimationFrame(animation);