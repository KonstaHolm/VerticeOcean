import * as dat from 'dat.gui';
import gsap from 'gsap';
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

const gui = new dat.GUI();
const world = {
  plane: {
    width: 600,
    height: 600,
    widthSegments: 150,
    heightSegments: 150
  }
}

function generatePlane() {
  // Color attribute addition
  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);
  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

  // Vertice position randomization
  const { array } = planeMesh.geometry.attributes.position
  const randomValues = [];
  for (let i = 0; i < array.length; i++) {

    if(i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      
      array[i] = x + (Math.random() - 0.5) * 0.5;
      array[i + 1] = y + (Math.random() - 0.5) * 0.5;
      array[i + 2] = z + (Math.random() - 0.5) * 1;
    }

    randomValues.push(Math.random() - Math.PI * 3);
  }
  
  planeMesh.geometry.attributes.position.randomValues = randomValues;
  planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array;
}

// GUI options
gui.add(world.plane, 'width', 1, 800).onChange(generatePlane);
gui.add(world.plane, 'height', 1, 800).onChange(generatePlane);
gui.add(world.plane, 'widthSegments', 1, 400).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 1, 400).onChange(generatePlane);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const raycaster = new THREE.Raycaster();

// Position camera camera
camera.position.z = 40;

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.setClearColor(0, 0, 0);
document.body.appendChild(renderer.domElement);

// Plane create
const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);
const planeMaterial = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, flatShading: THREE.FlatShading, vertexColors: true })
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh)

generatePlane();

// Light
const light = new THREE.DirectionalLight(0xffffff, 2)
const backLight = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 10);
backLight.position.set(0, 0, -1);
scene.add(light);
scene.add(backLight);

// Create and add stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
})

const starVerticies = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVerticies.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVerticies, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Mouse init
const mouse = {
  x: undefined,
  y: undefined
}

// Animate the page
let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  frame += 0.01;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planeMesh);

  //Make the vertice map move
  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    // X-coordinate
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003;

    // Y-coordinate
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.005;

    // Z-coordinate
    array[i + 2] = originalPosition[i + 2] + Math.sin(frame + randomValues[i + 2]) * 0.01;
  }
  
  planeMesh.geometry.attributes.position.needsUpdate = true;
  
  // Set color of vertice based on mouse movement and make it fade back to initial color
  if(intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;

    // Vertice 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    // Vertice 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    // Vertice 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    color.needsUpdate = true;

    const initialColor = { r: 0, g: 0.19, b: 0.4 }
    const hoverColor = { r: 0.1, g: 0.5,  b: 1 }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        // Vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        // Vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        // Vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
      }
    })
  }

  stars.rotation.y += 0.0003;
}
animate()


// Mouse position setting
addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = (event.clientY / innerHeight) * -2 + 1;
})

gsap.to('#first', {
  opacity: 1,
  duration: 2,
  delay: 0.5,
  y: -30,
  ease: 'expo'
})

gsap.to('#second', {
  opacity: 1,
  duration: 2,
  delay: 2,
  y: -80,
  ease: 'expo'
})

gsap.to('#oceanBtn', {
  opacity: 1,
  duration: 2,
  delay: 3,
  ease: 'expo'
})

document.querySelector('#oceanBtn').addEventListener('click', (e) => {
  e.preventDefault();
  gsap.to('#container', {
    opacity: 0
  })

  gsap.to(camera.position, {
    z: 5,
    ease: 'power3.inOut',
    duration: 2
  })

  gsap.to(camera.rotation, {
    x: 1.57,
    ease: 'power3.inOut',
    duration: 2
  })

  gsap.to(camera.position, {
    y: 1000,
    ease: 'power3.in',
    delay: 2,
    duration: 1.5
  })

const clearColor = new THREE.Color(0xffffff);
const currentColor = renderer.getClearColor();

gsap.to(currentColor, {
  r: clearColor.r,
  g: clearColor.g,
  b: clearColor.b,
  delay: 3.2,
  duration: 1,
  onUpdate: function() {
    renderer.setClearColor(currentColor);
  },
  onComplete: function() {
    window.location = 'https://www.nationalgeographic.com/environment/topic/oceans';
  }
});
})

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})