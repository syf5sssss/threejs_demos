<script setup>
import { ref, onMounted, markRaw } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Group } from '@tweenjs/tween.js';
import { tw_control, tw_zoom, tw_camera_move, tw_models_move, tw_model_multi_move } from '@util/tweenutil.js';
import { create_boards } from '@util/boardutil.js';
import { clear_scene, clear_models } from '@util/threeutil.js';

const container = ref(null);
let scene = null;
let camera = null;
let controls = null;

let ufo1 = '/ufo2.glb';
let ufo_board1 = '/ufo_board1.glb';
const tweenGroup = new Group();
const mode = ref(-1);
const iscontrol = ref(true);
let prr1 = new Array(9);
let prr2 = new Array(9);
let twDuration = 500;
let raycaster, mouse;
let ufopos = create_boards(3, 3);
let hole, ShowBoards = [], fullBoardUfo = [], emptyBoardUfo = [];

//加载模型
const loadModels = async () => {
    [ufo1, ufo_board1] = await Promise.all([
        loadModel(ufo1),
        loadModel(ufo_board1)
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

    camera = markRaw(new THREE.PerspectiveCamera(50, 1, 1, 10));
    camera.position.z = 1;
    camera.position.x = 1;
    camera.position.y = 1;

    controls = markRaw(new OrbitControls(camera, container.value));
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.enableZoom = false;

    let new_ufo_board1 = ufo_board1.scene.clone();
    let p = new THREE.Vector3(0, 0, 0);
    new_ufo_board1.position.copy(p);
    scene.add(new_ufo_board1);

    scene.add(markRaw(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 3)));
    const light = markRaw(new THREE.DirectionalLight(0xffffff, 1.5));
    light.position.set(1, 1, 1);
    scene.add(light);

    nextMode();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false); // 监听鼠标移动事件

    camera.updateProjectionMatrix();
}

/**
 * 进入下一个模式
 */
function nextMode() {
    if (mode.value >= 3) {
        mode.value = 0;
    } else {
        mode.value = mode.value + 1;
    }
    console.log('下一个模式', mode.value);
    //初始页面，选择整体
    if (mode.value === 0) {
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        clear_scene(scene);
        controls.target.set(0.8, 0.3, 0.8);
        camera.position.set(3, 1, 6);
        showall();
    }
    //选择一列
    if (mode.value === 1) {
        tw_camera_move(camera, new THREE.Vector3(0.8, 3, 0.8), tweenGroup, twDuration, controls, iscontrol.value);
        tw_control(controls, new THREE.Vector3(0.8, 0.3, 0.7999), tweenGroup, twDuration, iscontrol.value);
        // tw_zoom(camera, { value: m1pam.zoom }, tweenGroup, twDuration, controls, iscontrol.value);
    }
    //选择飞机场
    if (mode.value === 2) {
        const holeboards = ShowBoards.filter(ball => ball.userData.pos.includes(hole));
        const topIndex = showholeboards(holeboards);
        tw_models_move(holeboards, topIndex, new THREE.Vector3(0, 0, 0), tweenGroup, twDuration, controls, iscontrol.value);
        tw_camera_move(camera, new THREE.Vector3(0, 0.1, 0.7999), tweenGroup, twDuration, controls, iscontrol.value);
        tw_control(controls, new THREE.Vector3(0, 0, 0), tweenGroup, twDuration, iscontrol.value);
        // tw_zoom(camera, { value: m2pam.zoom }, tweenGroup, twDuration, controls, iscontrol.value);
    }
    //选择飞碟
    if (mode.value === 3) {
        clear_scene(scene);
        // camera.position.set(0, 1, 0);
        showboardmove();
        tw_camera_move(camera, new THREE.Vector3(0, 0.4, 0.4), tweenGroup, twDuration, controls, iscontrol.value);
        tw_control(controls, new THREE.Vector3(0, 0, 0), tweenGroup, twDuration, iscontrol.value);//2, -9, 12
        // tw_zoom(camera, { value: m3pam.zoom }, tweenGroup, twDuration, controls, iscontrol.value);
    }
}

/**
 * 展示一整个布局
 */
function showall() {
    ShowBoards = [];
    for (let k = 0; k < 3; k++) {
        for (let i = 0; i < 3; i++) {
            for (let z = 0; z < 3; z++) {
                let rp = "X" + (3 * 3 - (k * 3 + i)).toString().padStart(2, '0') + "-Y" + z.toString().padStart(2, '0');
                let newshowboard;
                newshowboard = ufo_board1.scene.clone();
                newshowboard.userData = {
                    boardNumber: "UFO" + (ShowBoards.length + 1).toString().padStart(4, '0'),
                    pos: rp,
                    isBoard: true,
                    originalMaterials: {}
                };
                newshowboard.traverse((child) => {
                    if (child.isMesh && child.material) {
                        newshowboard.userData.originalMaterials[child.uuid] = child.material.clone();
                    }
                });
                let p = new THREE.Vector3((i * 0.8), 0.3 * z, (k * 0.8) * 1);
                // console.log(p);
                newshowboard.position.copy(p);
                scene.add(newshowboard);
                ShowBoards.push(newshowboard);
            }
        }
    }
}

/**
 * 展示一个孔位的所有飞机场
 */
function showholeboards(holeboards) {
    // 删除其他飞机场---------
    const ballsToRemove = [];
    ShowBoards.forEach((ball) => {
        if (!holeboards.includes(ball)) {
            ballsToRemove.push(ball);
        }
    });
    // 从场景中移除模型
    clear_models(scene, ballsToRemove);
    // 从数组中移除模型
    ballsToRemove.forEach((ball) => {
        const index = ShowBoards.indexOf(ball);
        if (index > -1) {
            ShowBoards.splice(index, 1);
        }
    });
    // 删除其他飞机场---------end

    // 找出最上面的飞机场
    const topboard = holeboards.reduce((prev, current) => {
        return current.position.y > prev.position.y ? current : prev;
    });
    const topIndex = holeboards.findIndex(item => item === topboard);
    return topIndex;
}


/**
 * 展示两个飞机场飞碟移动的画面
 */
function showboardmove() {
    fullBoardUfo = [];
    emptyBoardUfo = [];
    prr1 = new Array(9);
    prr2 = new Array(9);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;//如果使用push，没有指明索引，后续加载到数组的循环时，可能会有undefined 
            prr1[index] = new THREE.Vector3(-0.6 + (j * 0.2), 0.1, (i * 0.2) - 0.2);
            prr2[index] = new THREE.Vector3(0.2 + (j * 0.2), 0.1, (i * 0.2) - 0.2);
        }
    }
    // 创建两个飞机场
    const fullBoard = ufo_board1.scene.clone();
    fullBoard.position.x = -0.4;
    fullBoard.position.y = 0;
    const emptyBoard = ufo_board1.scene.clone();
    emptyBoard.position.x = 0.4;
    emptyBoard.position.y = 0;
    // 填充满的飞机场
    for (let i = 0; i < prr1.length; i++) {
        const newUfo = ufo1.scene.clone();
        newUfo.userData = {
            UfoNumber: "U010" + i.toString().padStart(4, '0'),
            pos: ufopos[i],
            isUfo: true,
            originalMaterials: {}
        };
        newUfo.traverse((child) => {
            if (child.isMesh && child.material) {
                newUfo.userData.originalMaterials[child.uuid] = child.material.clone();
            }
        });

        newUfo.position.copy(prr1[i]);
        scene.add(newUfo);
        fullBoardUfo.push(newUfo);
    }

    scene.add(fullBoard);
    scene.add(emptyBoard);
}

/**
 * 鼠标点击事件
 * @param event 事件对象
 */
const onMouseDown = (event) => {
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const rect = container.value.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    // 计算射线与场景中物体的交点
    let intersects;
    if (mode.value === 0) {
        intersects = raycaster.intersectObjects(ShowBoards);
        if (intersects.length > 0) {
            nextMode();
        }
    }
    else if (mode.value === 1) {
        intersects = raycaster.intersectObjects(ShowBoards);
        if (intersects.length > 0 && hole && hole.length > 0) {
            nextMode();
        }
    }
    else if (mode.value === 2) {
        intersects = raycaster.intersectObjects(ShowBoards);
        if (intersects.length > 0) {
            nextMode();
        }
    }
    else if (mode.value === 3) {
        intersects = raycaster.intersectObjects(fullBoardUfo);
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const selectedUfo = findRootUfo(selectedMesh);
            const emptySlotIndex = emptyBoardUfo.length;
            if (emptySlotIndex < 9) {
                let currentPosition = selectedUfo.position.clone();
                let targetPosition = prr2[emptySlotIndex].clone();
                targetPosition.y = targetPosition.y + 0.2;
                let currentPosition1 = currentPosition.clone();
                currentPosition1.y = currentPosition.y + 0.2;
                let currentPosition3 = targetPosition.clone();
                currentPosition3.y = targetPosition.y - 0.2;
                // 定义移动步骤
                const steps = [
                    { target: currentPosition1, duration: twDuration }, // 先向上移动 8
                    { target: targetPosition, duration: twDuration }, // 再向某一位置移动
                    { target: currentPosition3, duration: twDuration } // 最后向下移动 8
                ];
                tw_model_multi_move(selectedUfo, steps, tweenGroup, controls, iscontrol.value);
                selectedUfo.userData.pos = ufopos[emptySlotIndex];
                fullBoardUfo = fullBoardUfo.filter(s => s !== selectedUfo);
                emptyBoardUfo.push(selectedUfo);
            } else {
                console.log("空的飞机场已满，无法移动飞碟");
            }
        } else {
            if (emptyBoardUfo.length >= 9) {
                nextMode();
            }
        }
    }
};
/**
 * 鼠标移动事件
 * @param event 事件对象
 */
const onMouseMove = (event) => {
    const tooltip = document.getElementById('tooltip');
    const rect = container.value.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1;

    let intersects;
    raycaster.setFromCamera(mouse, camera);
    // console.log(raycaster);
    if (mode.value === 0) {
        intersects = raycaster.intersectObjects([...ShowBoards]);
        // 遍历所有飞碟，恢复原始材质
        [...ShowBoards].forEach(ufo1 => {
            if (ufo1.userData && ufo1.userData.originalMaterials) {
                ufo1.traverse((child) => {
                    if (child.isMesh && child.material && ufo1.userData.originalMaterials[child.uuid]) {
                        child.material = ufo1.userData.originalMaterials[child.uuid].clone();
                    }
                });
            }
        });
        if (intersects.length > 0) {
            tooltip.style.display = 'none';
            for (let i = 0; i < ShowBoards.length; i++) {
                const selectedUfo = ShowBoards[i];
                // 改变选中飞碟的材质以表示选中状态
                if (selectedUfo.userData && selectedUfo.userData.originalMaterials) {
                    selectedUfo.traverse((child) => {
                        if (child.isMesh && child.material) {
                            const originalMaterial = selectedUfo.userData.originalMaterials[child.uuid];
                            const highlightMaterial = originalMaterial.clone();
                            highlightMaterial.color.multiplyScalar(10); // 简单示例，将颜色变亮
                            child.material = highlightMaterial;
                        }
                    });
                }
            }
        }
        event.stopPropagation(); // 阻止事件冒泡
    }
    if (mode.value === 1) {
        intersects = raycaster.intersectObjects([...ShowBoards]);
        // 遍历所有飞碟，恢复原始材质
        [...ShowBoards].forEach(ufo1 => {
            if (ufo1.userData && ufo1.userData.originalMaterials) {
                ufo1.traverse((child) => {
                    if (child.isMesh && child.material && ufo1.userData.originalMaterials[child.uuid]) {
                        child.material = ufo1.userData.originalMaterials[child.uuid].clone();
                    }
                });
            }
        });
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const selectedUfo = findRootBoard(selectedMesh);
            const pos = selectedUfo.userData.pos;
            const splitArray = pos.split('-');
            hole = splitArray.length >= 2 ? splitArray[0] : null;
            tooltip.innerHTML = `位置: ${hole}`;
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 'px';
            tooltip.style.top = event.clientY + 'px';
            for (let i = 0; i < ShowBoards.length; i++) {
                let t = ShowBoards[i];
                if (t.userData && t.userData.pos.includes(hole)) {
                    // 改变选中飞碟的材质以表示选中状态
                    if (t.userData.originalMaterials) {
                        t.traverse((child) => {
                            if (child.isMesh && child.material) {
                                const originalMaterial = t.userData.originalMaterials[child.uuid];
                                const highlightMaterial = originalMaterial.clone();
                                // highlightMaterial.color.multiplyScalar(10); // 简单示例，将颜色变亮
                                highlightMaterial.color.set(0xffff00); // 设置为红色
                                child.material = highlightMaterial;
                            }
                        });
                    }
                }
            }
        } else {
            tooltip.style.display = 'none';
        }

        event.stopPropagation(); // 阻止事件冒泡
    }
    if (mode.value === 2) {
        intersects = raycaster.intersectObjects([...ShowBoards]);
        // 遍历所有飞碟，恢复原始材质
        [...ShowBoards].forEach(ufo1 => {
            if (ufo1.userData && ufo1.userData.originalMaterials) {
                ufo1.traverse((child) => {
                    if (child.isMesh && child.material && ufo1.userData.originalMaterials[child.uuid]) {
                        child.material = ufo1.userData.originalMaterials[child.uuid].clone();
                    }
                });
            }
        });
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const selectedUfo = findRootBoard(selectedMesh);
            const UfoNumber = selectedUfo.userData.boardNumber;
            const pos = selectedUfo.userData.pos;
            tooltip.innerHTML = `Ufo编号: ${UfoNumber} <br> 位置: ${pos}`;
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 'px';
            tooltip.style.top = event.clientY + 'px';
            // 改变选中飞碟的材质以表示选中状态
            if (selectedUfo.userData && selectedUfo.userData.originalMaterials) {
                selectedUfo.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const originalMaterial = selectedUfo.userData.originalMaterials[child.uuid];
                        const highlightMaterial = originalMaterial.clone();
                        // highlightMaterial.color.multiplyScalar(10); // 简单示例，将颜色变亮
                        highlightMaterial.color.set(0xffff00); // 设置为红色
                        // highlightMaterial.transparent = true;
                        // highlightMaterial.opacity = 0.5; // 设置透明度
                        child.material = highlightMaterial;
                    }
                });
            }
        } else {
            tooltip.style.display = 'none';
        }

        event.stopPropagation(); // 阻止事件冒泡
    }
    if (mode.value === 3) {
        intersects = raycaster.intersectObjects([...fullBoardUfo, ...emptyBoardUfo]);
        // 遍历所有飞碟，恢复原始材质
        [...fullBoardUfo, ...emptyBoardUfo].forEach(ufo1 => {
            if (ufo1.userData && ufo1.userData.originalMaterials) {
                ufo1.traverse((child) => {
                    if (child.isMesh && child.material && ufo1.userData.originalMaterials[child.uuid]) {
                        child.material = ufo1.userData.originalMaterials[child.uuid].clone();
                    }
                });
            }
        });
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const selectedUfo = findRootUfo(selectedMesh);
            const UfoNumber = selectedUfo.userData.UfoNumber;
            const pos = selectedUfo.userData.pos;
            tooltip.innerHTML = `ufo编号: ${UfoNumber} <br> 位置: ${pos}`;
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 'px';
            tooltip.style.top = event.clientY + 'px';
            // 改变选中飞碟的材质以表示选中状态
            if (selectedUfo.userData && selectedUfo.userData.originalMaterials) {
                selectedUfo.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const originalMaterial = selectedUfo.userData.originalMaterials[child.uuid];
                        const highlightMaterial = originalMaterial.clone();
                        highlightMaterial.color.multiplyScalar(10); // 简单示例，将颜色变亮
                        // highlightMaterial.color.set(0xff0000); // 设置为红色
                        // highlightMaterial.transparent = true;
                        // highlightMaterial.opacity = 0.5; // 设置透明度
                        child.material = highlightMaterial;
                    }
                });
            }
        } else {
            tooltip.style.display = 'none';
        }

        event.stopPropagation(); // 阻止事件冒泡
    }

};

/**
 * 获取飞碟整体模型
 * @param object 选中模型
 */
const findRootUfo = (object) => {
    let current = object;
    while (current.parent && !current.userData.isUfo) {
        current = current.parent;
    }
    return current;
};
/**
 * 获取飞机场整体模型
 * @param object 选中模型
 */
const findRootBoard = (object) => {
    let current = object;
    while (current.parent && !current.userData.isBoard) {
        current = current.parent;
    }
    return current;
};

const update = () => {
    controls.update();
    tweenGroup.update();
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
        <div class="description">UFO_Boards</div>
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