import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

// import Stats from './jsm/libs/stats.module.js';

// import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { OBJLoader } from "https://threejs.org/examples/jsm/loaders/OBJLoader.js";
import { EXRLoader } from "https://threejs.org/examples/jsm/loaders/EXRLoader.js";


var container;
var camera, scene, renderer;
let exrCubeRenderTarget, exrBackground;
let newEnvMap;
let torusMesh, planeMesh;

var mouseX=0;
var mouseY=0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var object;

init();
animate();

function init() {
    container = document.createElement("div");
    container.className = "object";
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    camera.position.z = 250;
    scene = new THREE.Scene();
    scene.add(camera);

    //manager
    function loadModel() {
        THREE.DefaultLoadingManager.onLoad = function () {
            pmremGenerator.dispose();
        };

        // -----------------

        function loadObjectAndAndEnvMap() {
            object.traverse(function (child) {
                //This allow us to check if the children is an instance of the Mesh constructor
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: "#555",
                        roughness: 0.0,
                        metalness: 2.0,
                        envMapIntensity: 5.0
                    });
                    //child.material.flatShading = false;

                    console.log("setting envmap");
                    child.material.envMap = newEnvMap;
                    child.material.needsUpdate = true;

                    //Sometimes there are some vertex normals missing in the .obj files, ThreeJs will compute them
                }
            });
            object.position.y = -90;
            scene.add(object);
        }
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        new EXRLoader()
            .setDataType(THREE.UnsignedByteType)
            .load(
                "https://threejs.org/examples/textures/piz_compressed.exr",
                function (texture) {
                    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                    exrBackground = exrCubeRenderTarget.texture;
                    newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;

                    loadObjectAndAndEnvMap(); // Add envmap once the texture has been loaded

                    texture.dispose();
                }
            );

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    var manager = new THREE.LoadingManager(loadModel);

    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    // model
    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log("model " + Math.round(percentComplete, 2) + "% downloaded");
        }
    }
    function onError() {}
    var loader = new OBJLoader(manager);
    loader.load(
        "https://threejs.org/examples/models/obj/female02/female02.obj",
        function (obj) {
            object = obj;
        },
        onProgress,
        onError
    );

    //

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener("mousemove", onDocumentMouseMove, false);

    //

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
}

//

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;

    camera.lookAt(scene.position);

    scene.background = exrBackground;
    renderer.toneMappingExposure = 1.0;
    renderer.render(scene, camera);
}