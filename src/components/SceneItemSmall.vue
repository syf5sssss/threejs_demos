<script setup>
import { ref, onMounted, markRaw } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const props = defineProps({
    index: Number
});

const container = ref(null);
let scene = null;
let camera = null;
let controls = null;
let mesh = null;

const geometries = [
    () => new THREE.BoxGeometry(1, 1, 1),
    () => new THREE.SphereGeometry(0.5, 12, 8),
    () => new THREE.DodecahedronGeometry(0.5),
    () => new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
];

const initScene = () => {
    scene = markRaw(new THREE.Scene());

    camera = markRaw(new THREE.PerspectiveCamera(50, 1, 1, 10));
    camera.position.z = 2;

    controls = markRaw(new OrbitControls(camera, container.value));
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.enableZoom = false;

    const geometry = geometries[Math.floor(Math.random() * geometries.length)]();
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.75, THREE.SRGBColorSpace),
        roughness: 0.5,
        metalness: 0,
        flatShading: true
    });

    mesh = markRaw(new THREE.Mesh(geometry, material));
    scene.add(mesh);

    scene.add(markRaw(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 3)));
    const light = markRaw(new THREE.DirectionalLight(0xffffff, 1.5));
    light.position.set(1, 1, 1);
    scene.add(light);
}

const update = () => {
    if (mesh) {
        mesh.rotation.y = Date.now() * 0.001;
    }
    controls.update();
}

onMounted(initScene);

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
        <div class="description">Small Scene</div>
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
    width: 200px;
    height: 200px;
}

.description {
    color: #888;
    font-family: sans-serif;
    font-size: large;
    width: 200px;
    margin-top: 0.5em;
}
</style>