import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('scene-container');
const tooltip = document.getElementById('tooltip');
const partTitle = document.getElementById('partTitle');
const partDescription = document.getElementById('partDescription');
const partFunction = document.getElementById('partFunction');
const btnReset = document.getElementById('btnReset');
const btnLatido = document.getElementById('btnLatido');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 13, 28);

const camera = new THREE.PerspectiveCamera(
  42,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 1.2, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 20;
controls.target.set(0, 0.2, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;

scene.add(new THREE.AmbientLight(0xffffff, 1.7));

const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
keyLight.position.set(5, 8, 8);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x4caeff, 35, 20);
fillLight.position.set(-6, 2, 5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xff3159, 30, 18);
rimLight.position.set(5, -1, -4);
scene.add(rimLight);

const heartGroup = new THREE.Group();
heartGroup.rotation.z = -0.08;
scene.add(heartGroup);

const materials = {
  muscle: new THREE.MeshStandardMaterial({
    color: 0xa80f2d,
    roughness: 0.48,
    metalness: 0.02
  }),
  muscleDark: new THREE.MeshStandardMaterial({
    color: 0x7d0c25,
    roughness: 0.53
  }),
  red: new THREE.MeshStandardMaterial({
    color: 0xd91d3d,
    roughness: 0.38
  }),
  blue: new THREE.MeshStandardMaterial({
    color: 0x176cac,
    roughness: 0.4
  })
};

const data = {
  auriculaDerecha: {
    nombre: 'Aurícula derecha',
    descripcion: 'Cavidad superior derecha que recibe la sangre que retorna desde el cuerpo.',
    funcion: 'Recibir sangre con menor cantidad de oxígeno proveniente de las venas cavas y dirigirla al ventrículo derecho.'
  },
  auriculaIzquierda: {
    nombre: 'Aurícula izquierda',
    descripcion: 'Cavidad superior izquierda que recibe sangre procedente de los pulmones.',
    funcion: 'Recibir sangre oxigenada de las venas pulmonares y enviarla al ventrículo izquierdo.'
  },
  ventriculoDerecho: {
    nombre: 'Ventrículo derecho',
    descripcion: 'Cavidad inferior derecha del corazón.',
    funcion: 'Impulsar sangre hacia los pulmones mediante la arteria pulmonar para que se oxigene.'
  },
  ventriculoIzquierdo: {
    nombre: 'Ventrículo izquierdo',
    descripcion: 'Cavidad de paredes musculares gruesas ubicada principalmente en la zona inferior izquierda.',
    funcion: 'Bombear sangre oxigenada con presión suficiente hacia la aorta y el resto del organismo.'
  },
  aorta: {
    nombre: 'Aorta',
    descripcion: 'Principal arteria de la circulación sistémica.',
    funcion: 'Transportar la sangre oxigenada desde el ventrículo izquierdo hacia todo el cuerpo.'
  },
  arteriaPulmonar: {
    nombre: 'Arteria pulmonar',
    descripcion: 'Vaso sanguíneo que sale del ventrículo derecho.',
    funcion: 'Llevar sangre con menor cantidad de oxígeno desde el corazón hacia los pulmones.'
  },
  venaCavaSuperior: {
    nombre: 'Vena cava superior',
    descripcion: 'Gran vena que desemboca en la aurícula derecha desde la parte superior del cuerpo.',
    funcion: 'Retornar al corazón sangre procedente de cabeza, cuello, brazos y tórax.'
  },
  venaCavaInferior: {
    nombre: 'Vena cava inferior',
    descripcion: 'Gran vena que llega a la aurícula derecha desde la parte inferior del cuerpo.',
    funcion: 'Retornar al corazón sangre procedente de abdomen, pelvis y extremidades inferiores.'
  }
};

const selectableMeshes = [];
const partsById = {};

function register(mesh, id) {
  mesh.userData.partId = id;
  mesh.userData.baseMaterial = mesh.material;
  selectableMeshes.push(mesh);
  if (!partsById[id]) partsById[id] = [];
  partsById[id].push(mesh);
  heartGroup.add(mesh);
  return mesh;
}

function makeEllipsoid(id, scale, position, material, rotation = [0, 0, 0]) {
  const geometry = new THREE.SphereGeometry(1, 64, 48);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return register(mesh, id);
}

function makeVessel(id, radius, length, position, material, rotation = [0, 0, 0]) {
  const geometry = new THREE.CylinderGeometry(radius, radius * 1.08, length, 40);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return register(mesh, id);
}

makeEllipsoid('ventriculoIzquierdo', [1.55, 2.35, 1.35], [0.65, -0.65, 0], materials.muscle, [0, 0, -0.24]);
makeEllipsoid('ventriculoDerecho', [1.35, 2.05, 1.12], [-0.72, -0.5, 0.42], materials.muscleDark, [0.05, 0.1, 0.28]);

makeEllipsoid('auriculaIzquierda', [0.98, 0.92, 0.88], [0.9, 1.35, -0.15], materials.red, [0, 0.1, -0.12]);
makeEllipsoid('auriculaDerecha', [1.05, 1.0, 0.9], [-1.0, 1.22, 0.25], materials.blue, [0, -0.08, 0.12]);

makeVessel('aorta', 0.42, 2.8, [0.45, 2.65, -0.12], materials.red, [0, 0, -0.12]);
makeVessel('arteriaPulmonar', 0.36, 2.3, [-0.55, 2.25, 0.55], materials.blue, [0, 0, Math.PI / 3.8]);
makeVessel('venaCavaSuperior', 0.34, 2.2, [-1.18, 2.7, 0.25], materials.blue, [0, 0, 0.03]);
makeVessel('venaCavaInferior', 0.33, 2.1, [-0.82, -2.25, 0.18], materials.blue, [0, 0, -0.04]);

// Arco de la aorta
const aortaCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.45, 3.7, -0.12),
  new THREE.Vector3(0.7, 4.15, -0.08),
  new THREE.Vector3(1.35, 4.25, 0.0),
  new THREE.Vector3(1.65, 3.55, 0.05)
]);
const aortaTube = new THREE.Mesh(
  new THREE.TubeGeometry(aortaCurve, 40, 0.42, 24, false),
  materials.red
);
register(aortaTube, 'aorta');

// Surco visual para separar ambos ventrículos
const grooveMat = new THREE.MeshStandardMaterial({
  color: 0x3f0715,
  roughness: 0.7
});
const groove = new THREE.Mesh(
  new THREE.TorusGeometry(1.55, 0.075, 12, 70, Math.PI * 0.75),
  grooveMat
);
groove.position.set(0.05, -0.15, 1.13);
groove.rotation.z = -0.95;
heartGroup.add(groove);

// Pequeños vasos coronarios decorativos
function addCoronary(points) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 40, 0.035, 8, false),
    new THREE.MeshStandardMaterial({ color: 0xff876f, roughness: 0.45 })
  );
  heartGroup.add(mesh);
}

addCoronary([[0.1, 1.1, 1.15], [0.0, 0.3, 1.42], [-0.18, -0.8, 1.25], [-0.1, -1.8, 0.9]]);
addCoronary([[0.15, 1.05, 1.12], [0.8, 0.55, 1.15], [1.15, -0.4, 0.88]]);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedId = null;
let pulseEnabled = true;
let hoveredMesh = null;

const highlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffc247,
  emissive: 0x713000,
  emissiveIntensity: 0.8,
  roughness: 0.32
});

function resetMaterials() {
  selectableMeshes.forEach(mesh => {
    mesh.material = mesh.userData.baseMaterial;
  });
}

function selectPart(id) {
  selectedId = id;
  resetMaterials();

  (partsById[id] || []).forEach(mesh => {
    mesh.material = highlightMaterial;
  });

  document.querySelectorAll('[data-part]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.part === id);
  });

  const info = data[id];
  if (info) {
    partTitle.textContent = info.nombre;
    partDescription.textContent = info.descripcion;
    partFunction.textContent = info.funcion;
  }

  controls.autoRotate = false;
}

function getIntersections(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(selectableMeshes, false);
}

renderer.domElement.addEventListener('pointermove', event => {
  const hits = getIntersections(event);
  hoveredMesh = hits[0]?.object || null;

  if (hoveredMesh) {
    const id = hoveredMesh.userData.partId;
    tooltip.style.display = 'block';
    tooltip.textContent = data[id]?.nombre || 'Estructura cardíaca';
    tooltip.style.left = `${event.offsetX + 14}px`;
    tooltip.style.top = `${event.offsetY + 14}px`;
    renderer.domElement.style.cursor = 'pointer';
  } else {
    tooltip.style.display = 'none';
    renderer.domElement.style.cursor = 'grab';
  }
});

renderer.domElement.addEventListener('pointerleave', () => {
  tooltip.style.display = 'none';
});

renderer.domElement.addEventListener('click', event => {
  const hits = getIntersections(event);
  if (hits.length) {
    selectPart(hits[0].object.userData.partId);
  }
});

document.querySelectorAll('[data-part]').forEach(btn => {
  btn.addEventListener('click', () => selectPart(btn.dataset.part));
});

btnReset.addEventListener('click', () => {
  camera.position.set(0, 1.2, 12);
  controls.target.set(0, 0.2, 0);
  controls.autoRotate = true;
  selectedId = null;
  resetMaterials();

  document.querySelectorAll('[data-part]').forEach(btn => btn.classList.remove('active'));

  partTitle.textContent = 'Corazón humano';
  partDescription.textContent =
    'Selecciona una estructura en el modelo 3D o desde el panel izquierdo para conocer su función.';
  partFunction.textContent =
    'Bombear sangre para mantener el suministro de oxígeno y nutrientes en todo el organismo.';
});

btnLatido.addEventListener('click', () => {
  pulseEnabled = !pulseEnabled;
  btnLatido.textContent = pulseEnabled ? '♥ Pausar latido' : '♥ Activar latido';
});

const grid = new THREE.GridHelper(18, 18, 0x1a4564, 0x102a3d);
grid.position.y = -4.3;
scene.add(grid);

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  if (pulseEnabled) {
    const beat = 1 + Math.max(0, Math.sin(t * 4.6)) * 0.025;
    heartGroup.scale.setScalar(beat);
  } else {
    heartGroup.scale.setScalar(1);
  }

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
