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



const torusGeometry = new THREE.TorusGeometry( 15, 3, 4, 4 )
const material = new  THREE.MeshNormalMaterial( { 
  side : THREE.BackSide,
  wireframe: false, 
  flatShading: true,
} );	
const torusMaterial = new  THREE.MeshNormalMaterial( { 
  side : THREE.BackSide,
  wireframe: false, 
  flatShading: true,
} );	


const torus = new THREE.Mesh( torusGeometry, torusMaterial );
const tunnel = new THREE.Mesh( tunnelGeometry, material );
const torusClone0 = torus.clone()
const torusClone1 = torus.clone()
scene.add( torus );
scene.add( tunnel );
// scene.add(torusClone0)
// scene.add(torusClone1)



const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop( animation );

const controls = new OrbitControls(camera, renderer.domElement);






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
let cubeFlyBy = 0;

getSound(newAmplitude => {
  amplitude = newAmplitude;
});

let percentage = 0
let p1 = path.getPointAt(percentage%1);
let p2 = path.getPointAt((percentage + 0.01)%1);

let torusScale = 0.1
let torusClone0Scale = 0.038


  torus.scale.set(torusScale, torusScale, torusScale)
  // torusClone0.scale.set(torusClone0Scale, torusClone0Scale, torusClone0Scale)


  // torus.position.set(p2.x, p2.y, p2.z)  
  // torusClone0.position.set(p2.x, p2.y, p2.z)  
  // torusClone1.position.set(p2.x, p2.y, p2.z)  

let rotation = 0
function animation() {
  percentage += 0.000001;

  let p1 = path.getPointAt(percentage%1);
  let p2 = path.getPointAt((percentage + 0.01)%1);
  let p3 = path.getPointAt((percentage + 0.02)%1);


  let tubeTangent = path.getTangentAt(percentage%1);
  torus.position.copy(p3);
  torus.lookAt(p3.clone().add(tubeTangent));

  // torusClone0.position.copy(p2);
  // torusClone0.lookAt(p2.clone().add(tubeTangent));

  // torusClone1.position.copy(p2);
  // torusClone1.lookAt(p2.clone().add(tubeTangent));

  torus.rotateZ(percentage+=amplitude); // rotate the torus
  
  camera.position.set(p1.x,p1.y,p1.z);
  camera.lookAt(p2);
  light.position.set(p2.x, p2.y, p2.z);

  renderer.render(scene, camera);
  // controls.update();
  
  requestAnimationFrame(animation);

}

requestAnimationFrame(animation);