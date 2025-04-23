<script setup>
import { ref, onMounted, markRaw } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = ref(null);
let scene = null;
let camera = null;
let controls = null;
let new_ufo_board1;

let ufo1 = '/ufo2.glb';

//加载模型
const loadModels = async () => {
    [ufo1] = await Promise.all([
        loadModel(ufo1)
    ]);
};

const loadModel = (path) => {
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(path, resolve, undefined, reject);
    });
};

const initScene = async () => {
    await loadModels();
    scene = markRaw(new THREE.Scene());

    camera = markRaw(new THREE.PerspectiveCamera(50, 1, 0.01, 10));
    camera.position.z = 0.2;
    camera.position.x = 0;
    camera.position.y = 0.2;

    controls = markRaw(new OrbitControls(camera, container.value));
    controls.minDistance = 0.002;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.enableZoom = false;

    new_ufo_board1 = markRaw(ufo1.scene.clone());
    let p = new THREE.Vector3(0, 0, 0);
    new_ufo_board1.position.copy(p);
    scene.add(new_ufo_board1);

    scene.add(markRaw(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 3)));
    const light = markRaw(new THREE.DirectionalLight(0xffffff, 1.5));
    light.position.set(1, 1, 1);
    scene.add(light);

    camera.updateProjectionMatrix();
}

const update = () => {
    if (new_ufo_board1) {
        new_ufo_board1.rotation.y = Date.now() * 0.001;
    }
    controls.update();
}

onMounted(async () => {
    await initScene();
});

defineExpose({
    getScene: () => scene,
    getCamera: () => camera,
    getContainer: () => container.value,
    update
});
</script>
<template>
    <div class="list-item">
        <div ref="container" class="scene-container"></div>
        <div id="tooltip"
            style="display: none; position: fixed; background-color: white; border: 1px solid black; padding: 5px; z-index: 1000;">
        </div>
        <div class="description">UFO</div>
    </div>
</template>

<style scoped>
.list-item {
    display: inline-block;
    margin: 1em;
    padding: 1em;
    box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);
}

.scene-container {
    width: 400px;
    height: 400px;
}

.description {
    color: #888;
    font-family: sans-serif;
    font-size: large;
    width: 400px;
    margin-top: 0.5em;
}
</style>