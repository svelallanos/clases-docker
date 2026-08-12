import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    structures,
    modes
} from "./structures.js";


/* =============================
   ELEMENTOS HTML
============================= */

const viewer =
    document.getElementById(
        "viewer"
    );

const labelsLayer =
    document.getElementById(
        "labelsLayer"
    );

const tooltip =
    document.getElementById(
        "tooltip"
    );

const structureList =
    document.getElementById(
        "structureList"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const loading =
    document.getElementById(
        "loading"
    );

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

const modelError =
    document.getElementById(
        "modelError"
    );

const modelStatus =
    document.getElementById(
        "modelStatus"
    );


const sectionControls =
    document.getElementById(
        "sectionControls"
    );

const sectionRange =
    document.getElementById(
        "sectionRange"
    );

const btnSectionAxis =
    document.getElementById(
        "btnSectionAxis"
    );


const titleEl =
    document.getElementById(
        "structureTitle"
    );

const latinEl =
    document.getElementById(
        "structureLatin"
    );

const iconEl =
    document.getElementById(
        "structureIcon"
    );

const descriptionEl =
    document.getElementById(
        "structureDescription"
    );

const functionEl =
    document.getElementById(
        "structureFunction"
    );

const relationEl =
    document.getElementById(
        "structureRelation"
    );

const modeNameEl =
    document.getElementById(
        "modeName"
    );

const modeDescriptionEl =
    document.getElementById(
        "modeDescription"
    );


/* =============================
   ESCENA
============================= */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x02070c
    );


scene.fog =
    new THREE.FogExp2(
        0x02070c,
        0.055
    );


/* =============================
   CÁMARA
============================= */

const camera =
    new THREE.PerspectiveCamera(

        38,

        viewer.clientWidth /
        viewer.clientHeight,

        0.01,

        100

    );


camera.position.set(
    0,
    0.4,
    5.7
);


/* =============================
   RENDERER
============================= */

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:
            "high-performance"

    });


renderer.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        2
    )

);


renderer.setSize(

    viewer.clientWidth,

    viewer.clientHeight

);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.2;


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


renderer.localClippingEnabled =
    true;


viewer.appendChild(
    renderer.domElement
);


/* =============================
   CONTROLES
============================= */

const controls =
    new OrbitControls(

        camera,

        renderer.domElement

    );


controls.enableDamping =
    true;


controls.dampingFactor =
    0.055;


controls.minDistance =
    2;


controls.maxDistance =
    11;


controls.target.set(
    0,
    0,
    0
);


controls.autoRotate =
    true;


controls.autoRotateSpeed =
    0.28;


/* =============================
   ILUMINACIÓN
============================= */

const hemisphere =
    new THREE.HemisphereLight(

        0xd9eeff,

        0x15030a,

        1.5

    );


scene.add(
    hemisphere
);


/* Luz principal */

const key =
    new THREE.DirectionalLight(

        0xffeee7,

        4.2

    );


key.position.set(

    3.5,

    5,

    6

);


key.castShadow =
    true;


scene.add(
    key
);


/* Luz azul */

const fill =
    new THREE.PointLight(

        0x3ca9ff,

        32,

        12,

        2

    );


fill.position.set(

    -3.5,

    1,

    4

);


scene.add(
    fill
);


/* Luz roja */

const rim =
    new THREE.PointLight(

        0xff254c,

        34,

        12,

        2

    );


rim.position.set(

    3.8,

    0,

    -3

);


scene.add(
    rim
);


/* =============================
   GRUPO DEL CORAZÓN
============================= */

const heartRoot =
    new THREE.Group();


scene.add(
    heartRoot
);


/* =============================
   VARIABLES
============================= */

const raycaster =
    new THREE.Raycaster();


const pointer =
    new THREE.Vector2();


const clock =
    new THREE.Clock();


let model =
    null;


let selectableMeshes =
    [];


let selectedMesh =
    null;


let currentMode =
    "normal";


let pulseEnabled =
    true;


let labelsEnabled =
    true;


let sectionAxis =
    0;


/* =============================
   PLANO DE CORTE
============================= */

const clippingPlane =
    new THREE.Plane(

        new THREE.Vector3(
            0,
            0,
            -1
        ),

        0

    );


/* =============================
   FLUJO SANGUÍNEO
============================= */

const flowGroup =
    new THREE.Group();


flowGroup.visible =
    false;


scene.add(
    flowGroup
);


/* =============================
   MATERIALES ORIGINALES
============================= */

const originalMaterials =
    new WeakMap();


/* =============================
   LISTA DE ESTRUCTURAS
============================= */

function renderStructureList(
    filter = ""
) {

    const q =
        filter
            .trim()
            .toLowerCase();


    structureList.innerHTML =
        "";


    structures

        .filter(
            structure => {

                const text =

                    structure.nombre +

                    " " +

                    structure.latin;


                return (
                    !q ||
                    text
                        .toLowerCase()
                        .includes(q)
                );

            }
        )

        .forEach(
            structure => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "structure-btn";


                button.dataset.id =
                    structure.id;


                button.innerHTML = `

                    <span>

                        ${structure.icono}

                        ${structure.nombre}

                    </span>

                    <small>
                        ›
                    </small>

                `;


                button.addEventListener(

                    "click",

                    () => {

                        focusStructure(
                            structure.id
                        );

                    }

                );


                structureList.appendChild(
                    button
                );

            }
        );

}


renderStructureList();


searchInput.addEventListener(

    "input",

    event => {

        renderStructureList(
            event.target.value
        );

    }

);


/* =============================
   NORMALIZAR NOMBRES
============================= */

function normalizedName(
    name = ""
) {

    return name

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[_\-]+/g,
            " "
        );

}


/* =============================
   IDENTIFICAR ESTRUCTURA
============================= */

function identifyStructure(
    mesh
) {

    let text =
        "";


    let object =
        mesh;


    for (
        let i = 0;
        object && i < 5;
        i++,
        object = object.parent
    ) {

        text +=
            " " +
            normalizedName(
                object.name
            );

    }


    const found =
        structures.find(
            structure =>

                structure.keywords.some(

                    keyword =>

                        text.includes(

                            normalizedName(
                                keyword
                            )

                        )

                )

        );


    return found ||
        structures[0];

}


/* =============================
   INFORMACIÓN
============================= */

function updateInfo(
    structure
) {

    titleEl.textContent =
        structure.nombre;


    latinEl.textContent =
        structure.latin;


    iconEl.textContent =
        structure.icono;


    descriptionEl.textContent =
        structure.descripcion;


    functionEl.textContent =
        structure.funcion;


    relationEl.textContent =
        structure.relacion;


    document
        .querySelectorAll(
            ".structure-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.id ===
                    structure.id

                );

            }
        );

}


/* =============================
   RESALTAR PARTE
============================= */

function highlightMesh(
    mesh
) {

    if (
        selectedMesh &&
        selectedMesh.userData
            .activeMaterial
    ) {

        selectedMesh.material =
            selectedMesh.userData
                .activeMaterial;

    }


    selectedMesh =
        mesh;


    if (
        !mesh ||
        !mesh.material
    ) {

        return;

    }


    const source =
        mesh.userData
            .activeMaterial ||
        mesh.material;


    const clone =
        Array.isArray(source)

            ? source.map(
                material => {

                    const newMaterial =
                        material.clone();


                    if (
                        "emissive" in
                        newMaterial
                    ) {

                        newMaterial
                            .emissive
                            .setHex(
                                0x46101a
                            );

                    }


                    return newMaterial;

                }
            )

            : source.clone();


    if (
        !Array.isArray(clone) &&
        "emissive" in clone
    ) {

        clone.emissive.setHex(
            0x46101a
        );


        clone.emissiveIntensity =
            0.8;

    }


    mesh.material =
        clone;

}


/* =============================
   ENFOCAR ESTRUCTURA
============================= */

function focusStructure(
    id
) {

    const structure =

        structures.find(
            item =>
                item.id === id
        ) ||

        structures[0];


    updateInfo(
        structure
    );


    controls.autoRotate =
        false;


    const candidates =

        selectableMeshes.filter(

            mesh => {

                return (
                    identifyStructure(mesh)
                        .id ===
                    structure.id
                );

            }

        );


    if (
        candidates.length === 0
    ) {

        return;

    }


    const mesh =
        candidates[0];


    highlightMesh(
        mesh
    );


    const box =
        new THREE.Box3()
            .setFromObject(
                mesh
            );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    controls.target.copy(
        center
    );


    const size =
        box
            .getSize(
                new THREE.Vector3()
            )
            .length();


    const distance =
        THREE.MathUtils.clamp(

            size * 2.8,

            2.4,

            5.2

        );


    const direction =

        camera.position

            .clone()

            .sub(
                controls.target
            )

            .normalize();


    camera.position.copy(

        center
            .clone()
            .add(

                direction.multiplyScalar(
                    distance
                )

            )

    );

}


/* =============================
   AJUSTAR MODELO
============================= */

function fitModel(
    object
) {

    const box =
        new THREE.Box3()
            .setFromObject(
                object
            );


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const maxDimension =
        Math.max(

            size.x,

            size.y,

            size.z

        );


    const scale =
        3.65 /
        Math.max(
            maxDimension,
            0.0001
        );


    object.scale.setScalar(
        scale
    );


    object.position.copy(
        center
    );


    object.position.multiplyScalar(
        -scale
    );


    controls.target.set(
        0,
        0,
        0
    );

}


/* =============================
   PREPARAR MALLA
============================= */

function prepareMesh(
    mesh
) {

    selectableMeshes.push(
        mesh
    );


    mesh.castShadow =
        true;


    mesh.receiveShadow =
        true;


    const original =
        mesh.material;


    originalMaterials.set(

        mesh,

        original

    );


    const materials =
        Array.isArray(original)

            ? original

            : [original];


    materials.forEach(
        material => {

            if (
                "roughness" in
                material
            ) {

                material.roughness =
                    Math.min(

                        material.roughness
                            ?? 0.6,

                        0.52

                    );

            }


            if (
                "metalness" in
                material
            ) {

                material.metalness =
                    0;

            }


            material.side =
                THREE.DoubleSide;


            material.needsUpdate =
                true;

        }
    );


    mesh.userData.activeMaterial =
        original;

}


/* =============================
   CARGAR GLB
============================= */

function loadHeart() {

    const loader =
        new GLTFLoader();


    loader.load(

        "models/corazon.glb",


        /* ÉXITO */

        gltf => {

            model =
                gltf.scene;


            fitModel(
                model
            );


            model.traverse(
                object => {

                    if (
                        object.isMesh
                    ) {

                        prepareMesh(
                            object
                        );

                    }

                }
            );


            heartRoot.add(
                model
            );


            loading.classList.add(
                "hidden"
            );


            modelError.classList.add(
                "hidden"
            );


            modelStatus.textContent =

                `Modelo cargado · ${selectableMeshes.length} estructuras 3D`;


            buildLabels();


            createBloodFlow();

        },


        /* PROGRESO */

        event => {

            if (
                event.total > 0
            ) {

                const percent =

                    Math.round(

                        event.loaded /
                        event.total *
                        100

                    );


                loadingProgress.textContent =

                    percent + "%";

            }

            else {

                loadingProgress.textContent =

                    (
                        event.loaded /
                        1024 /
                        1024
                    ).toFixed(1)
                    +
                    " MB";

            }

        },


        /* ERROR */

        error => {

            console.error(
                error
            );


            loading.classList.add(
                "hidden"
            );


            modelError.classList.remove(
                "hidden"
            );


            modelStatus.textContent =
                "Modelo no disponible";

        }

    );

}


/* =============================
   CAMBIAR MODO
============================= */

function setMode(
    mode
) {

    currentMode =
        mode;


    const modeInfo =
        modes[mode];


    modeNameEl.textContent =
        modeInfo.nombre;


    modeDescriptionEl.textContent =
        modeInfo.descripcion;


    document
        .querySelectorAll(
            ".mode-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.mode ===
                    mode

                );

            }
        );


    sectionControls.classList.toggle(

        "hidden",

        mode !==
        "section"

    );


    flowGroup.visible =
        mode ===
        "flow";


    selectableMeshes.forEach(
        mesh => {

            const original =
                originalMaterials.get(
                    mesh
                );


            if (!original) {
                return;
            }


            const originals =
                Array.isArray(original)

                    ? original

                    : [original];


            const clones =
                originals.map(

                    material => {

                        const copy =
                            material.clone();


                        /* TRANSPARENTE */

                        if (
                            mode ===
                            "xray"
                        ) {

                            copy.transparent =
                                true;


                            copy.opacity =
                                0.25;


                            copy.depthWrite =
                                false;

                        }

                        else {

                            copy.transparent =
                                false;


                            copy.opacity =
                                1;


                            copy.depthWrite =
                                true;

                        }


                        /* CORTE */

                        copy.clippingPlanes =

                            mode ===
                            "section"

                                ? [
                                    clippingPlane
                                ]

                                : [];


                        copy.clipShadows =
                            true;


                        copy.side =
                            THREE.DoubleSide;


                        copy.needsUpdate =
                            true;


                        return copy;

                    }

                );


            const active =

                Array.isArray(original)

                    ? clones

                    : clones[0];


            mesh.material =
                active;


            mesh.userData.activeMaterial =
                active;

        }
    );

}


/* =============================
   BOTONES MODOS
============================= */

document
    .querySelectorAll(
        ".mode-btn"
    )
    .forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    setMode(
                        button.dataset.mode
                    );

                }

            );

        }

    );


/* =============================
   CORTE
============================= */

sectionRange.addEventListener(

    "input",

    () => {

        clippingPlane.constant =

            Number(
                sectionRange.value
            );

    }

);


btnSectionAxis.addEventListener(

    "click",

    () => {

        sectionAxis =

            (
                sectionAxis +
                1
            ) %
            3;


        if (
            sectionAxis === 0
        ) {

            clippingPlane.normal.set(
                0,
                0,
                -1
            );


            btnSectionAxis.textContent =
                "Eje: frontal";

        }


        else if (
            sectionAxis === 1
        ) {

            clippingPlane.normal.set(
                -1,
                0,
                0
            );


            btnSectionAxis.textContent =
                "Eje: lateral";

        }


        else {

            clippingPlane.normal.set(
                0,
                -1,
                0
            );


            btnSectionAxis.textContent =
                "Eje: transversal";

        }

    }

);


/* =============================
   RAYCASTER
============================= */

function pointerFromEvent(
    event
) {

    const rect =
        renderer.domElement
            .getBoundingClientRect();


    pointer.x =

        (
            (
                event.clientX -
                rect.left
            )
            /
            rect.width
        )
        *
        2
        -
        1;


    pointer.y =

        -
        (
            (
                event.clientY -
                rect.top
            )
            /
            rect.height
        )
        *
        2
        +
        1;

}


/* =============================
   MOUSE SOBRE ESTRUCTURA
============================= */

renderer.domElement
    .addEventListener(

        "pointermove",

        event => {

            if (
                selectableMeshes.length ===
                0
            ) {

                return;

            }


            pointerFromEvent(
                event
            );


            raycaster.setFromCamera(

                pointer,

                camera

            );


            const hit =

                raycaster
                    .intersectObjects(

                        selectableMeshes,

                        false

                    )[0];


            if (!hit) {

                tooltip.style.display =
                    "none";


                renderer.domElement
                    .style.cursor =
                    "grab";


                return;

            }


            const structure =
                identifyStructure(
                    hit.object
                );


            tooltip.textContent =
                structure.nombre;


            tooltip.style.display =
                "block";


            tooltip.style.left =

                event.clientX +
                13 +
                "px";


            tooltip.style.top =

                event.clientY +
                13 +
                "px";


            renderer.domElement
                .style.cursor =
                "pointer";

        }

    );


/* =============================
   CLIC EN ESTRUCTURA
============================= */

renderer.domElement
    .addEventListener(

        "click",

        event => {

            pointerFromEvent(
                event
            );


            raycaster.setFromCamera(

                pointer,

                camera

            );


            const hit =

                raycaster
                    .intersectObjects(

                        selectableMeshes,

                        false

                    )[0];


            if (!hit) {
                return;
            }


            controls.autoRotate =
                false;


            highlightMesh(
                hit.object
            );


            updateInfo(

                identifyStructure(
                    hit.object
                )

            );

        }

    );


/* =============================
   ETIQUETAS
============================= */

const labelAnchors = [

    {
        id:
            "aorta",

        p:
            [
                0.12,
                1.18,
                0.05
            ]
    },


    {
        id:
            "auricula_derecha",

        p:
            [
                -0.72,
                0.48,
                0.42
            ]
    },


    {
        id:
            "auricula_izquierda",

        p:
            [
                0.62,
                0.52,
                -0.1
            ]
    },


    {
        id:
            "ventriculo_derecho",

        p:
            [
                -0.54,
                -0.32,
                0.55
            ]
    },


    {
        id:
            "ventriculo_izquierdo",

        p:
            [
                0.52,
                -0.54,
                0.25
            ]
    }

];


const labelElements =
    [];


function buildLabels() {

    labelsLayer.innerHTML =
        "";


    labelElements.length =
        0;


    labelAnchors.forEach(

        anchor => {

            const structure =

                structures.find(

                    item =>
                        item.id ===
                        anchor.id

                );


            if (!structure) {
                return;
            }


            const element =

                document.createElement(
                    "div"
                );


            element.className =
                "anatomy-label";


            element.textContent =
                structure.nombre;


            labelsLayer.appendChild(
                element
            );


            labelElements.push({

                element,

                point:
                    new THREE.Vector3(
                        ...anchor.p
                    )

            });

        }

    );

}


/* =============================
   ACTUALIZAR ETIQUETAS
============================= */

function updateLabels() {

    labelsLayer.style.display =

        labelsEnabled

            ? "block"

            : "none";


    if (
        !labelsEnabled ||
        !model
    ) {

        return;

    }


    const rect =

        renderer.domElement
            .getBoundingClientRect();


    labelElements.forEach(

        item => {

            const world =
                item.point.clone();


            heartRoot.localToWorld(
                world
            );


            world.project(
                camera
            );


            const x =

                (
                    world.x *
                    0.5 +
                    0.5
                )
                *
                rect.width;


            const y =

                (
                    -world.y *
                    0.5 +
                    0.5
                )
                *
                rect.height;


            item.element.style.left =
                x + "px";


            item.element.style.top =
                y + "px";

        }

    );

}


/* =============================
   TUBO DE FLUJO
============================= */

function createTube(
    points,
    color
) {

    const curve =

        new THREE
            .CatmullRomCurve3(

                points.map(

                    point =>

                        new THREE.Vector3(
                            ...point
                        )

                )

            );


    const geometry =

        new THREE
            .TubeGeometry(

                curve,

                90,

                0.018,

                10,

                false

            );


    const material =

        new THREE
            .MeshBasicMaterial({

                color,

                transparent:
                    true,

                opacity:
                    0.34

            });


    const tube =

        new THREE.Mesh(

            geometry,

            material

        );


    flowGroup.add(
        tube
    );


    return curve;

}


/* =============================
   PARTÍCULAS DE SANGRE
============================= */

function createParticles(

    curve,

    color,

    count,

    speed = 0

) {

    const geometry =

        new THREE
            .SphereGeometry(

                0.038,

                10,

                8

            );


    const material =

        new THREE
            .MeshBasicMaterial({

                color

            });


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =

            new THREE.Mesh(

                geometry,

                material

            );


        particle.userData
            .flowCurve =
            curve;


        particle.userData
            .flowOffset =

            i /
            count;


        particle.userData
            .flowSpeed =

            0.055 +
            speed;


        flowGroup.add(
            particle
        );

    }

}


/* =============================
   CREAR FLUJO SANGUÍNEO
============================= */

function createBloodFlow() {

    /* Sangre con menor oxígeno */

    const bluePath =

        createTube(

            [

                [
                    -0.88,
                    1.55,
                    0.25
                ],

                [
                    -0.72,
                    0.62,
                    0.22
                ],

                [
                    -0.45,
                    -0.15,
                    0.25
                ],

                [
                    -0.22,
                    0.52,
                    0.38
                ],

                [
                    -0.5,
                    1.12,
                    0.35
                ],

                [
                    -1.25,
                    1.45,
                    0.1
                ]

            ],

            0x2a9ae2

        );


    /* Sangre oxigenada */

    const redPath =

        createTube(

            [

                [
                    1.25,
                    1.32,
                    -0.05
                ],

                [
                    0.66,
                    0.58,
                    -0.08
                ],

                [
                    0.52,
                    -0.54,
                    0.08
                ],

                [
                    0.23,
                    0.32,
                    -0.08
                ],

                [
                    0.15,
                    1.15,
                    -0.15
                ],

                [
                    0.9,
                    1.58,
                    -0.2
                ]

            ],

            0xee3156

        );


    createParticles(

        bluePath,

        0x49b9ff,

        18,

        0.003

    );


    createParticles(

        redPath,

        0xff5e79,

        18,

        0.007

    );

}


/* =============================
   ACTUALIZAR FLUJO
============================= */

function updateFlow(
    time
) {

    flowGroup.children
        .forEach(

            object => {

                if (
                    !object.userData
                        .flowCurve
                ) {

                    return;

                }


                const position =

                    (
                        time *
                        object.userData
                            .flowSpeed
                        +
                        object.userData
                            .flowOffset
                    )
                    %
                    1;


                object.position.copy(

                    object.userData
                        .flowCurve
                        .getPointAt(
                            position
                        )

                );

            }

        );

}


/* =============================
   BOTÓN ETIQUETAS
============================= */

document
    .getElementById(
        "btnLabels"
    )
    .addEventListener(

        "click",

        event => {

            labelsEnabled =
                !labelsEnabled;


            event.currentTarget
                .classList.toggle(

                    "active",

                    labelsEnabled

                );

        }

    );


/* =============================
   BOTÓN LATIDO
============================= */

document
    .getElementById(
        "btnPulse"
    )
    .addEventListener(

        "click",

        event => {

            pulseEnabled =
                !pulseEnabled;


            event.currentTarget
                .classList.toggle(

                    "active",

                    pulseEnabled

                );

        }

    );


/* =============================
   RESTABLECER
============================= */

document
    .getElementById(
        "btnReset"
    )
    .addEventListener(

        "click",

        () => {

            camera.position.set(

                0,

                0.4,

                5.7

            );


            controls.target.set(

                0,

                0,

                0

            );


            controls.autoRotate =
                true;


            updateInfo(
                structures[0]
            );


            setMode(
                "normal"
            );

        }

    );


/* =============================
   PANTALLA COMPLETA
============================= */

document
    .getElementById(
        "btnFullscreen"
    )
    .addEventListener(

        "click",

        async () => {

            try {

                if (
                    !document
                        .fullscreenElement
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                }

                else {

                    await document
                        .exitFullscreen();

                }

            }

            catch (
                error
            ) {

                console.warn(
                    error
                );

            }

        }

    );


/* =============================
   ANIMACIÓN
============================= */

function animate() {

    const time =
        clock.getElapsedTime();


    /* LATIDO */

    if (
        pulseEnabled &&
        model
    ) {

        const beat1 =

            Math.pow(

                Math.max(

                    0,

                    Math.sin(
                        time *
                        6.2
                    )

                ),

                9

            );


        const beat2 =

            Math.pow(

                Math.max(

                    0,

                    Math.sin(

                        time *
                        6.2 -
                        0.72

                    )

                ),

                12

            )
            *
            0.34;


        const scale =

            1 +

            beat1 *
            0.018 +

            beat2 *
            0.007;


        heartRoot.scale
            .setScalar(
                scale
            );

    }

    else {

        heartRoot.scale
            .setScalar(
                1
            );

    }


    updateFlow(
        time
    );


    controls.update();


    updateLabels();


    renderer.render(

        scene,

        camera

    );

}


renderer.setAnimationLoop(
    animate
);


/* =============================
   RESPONSIVE THREE.JS
============================= */

function resize() {

    const width =

        Math.max(

            viewer.clientWidth,

            1

        );


    const height =

        Math.max(

            viewer.clientHeight,

            1

        );


    camera.aspect =

        width /
        height;


    camera
        .updateProjectionMatrix();


    renderer.setSize(

        width,

        height

    );

}


window.addEventListener(

    "resize",

    resize

);


new ResizeObserver(
    resize
)
.observe(
    viewer
);


/* =============================
   INICIAR
============================= */

updateInfo(
    structures[0]
);


setMode(
    "normal"
);


loadHeart();
