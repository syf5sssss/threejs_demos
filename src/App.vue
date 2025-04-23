<template>
  <div id="app">
    <canvas id="c"></canvas>
    <div id="content">
      <SceneItem ref="sceneItem0" />
      <SceneItem ref="sceneItem1" />
      <UFO ref="sceneItem2" />
      <UFO_Board ref="sceneItem3" />
      <UFO_Boards ref="sceneItem4" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide, inject, nextTick } from 'vue'
import * as THREE from 'three'
import SceneItem from './components/SceneItem.vue'
import UFO from './components/UFO.vue'
import UFO_Board from './components/UFO_Board.vue'
import UFO_Boards from './components/UFO_Boards.vue'

const sceneItems = ref([]);
let canvas, renderer, socket;
let wsUrl = "ws://172.168.54.228:9999";
// 定义睡眠函数（参数为毫秒）
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sceneItem0 = ref(null);
const sceneItem1 = ref(null);
const sceneItem2 = ref(null);
const sceneItem3 = ref(null);
const sceneItem4 = ref(null);
const sceneItem5 = ref(null);
const sceneItem6 = ref(null);
const sceneItem7 = ref(null);
const sceneItem8 = ref(null);

onMounted(async () => {
  sceneItems.value = [
    sceneItem0.value,
    sceneItem1.value,
    sceneItem2.value,
    sceneItem3.value,
    sceneItem4.value,
  ];
  await sleep(100);
  sceneItems.value.forEach(item => {
    item.getScene().add(new THREE.AxesHelper(50)); // 红色=X，绿色=Y，蓝色=Z
  })
  initRenderer();
  // openWebSocket();
})


// 初始化渲染器
const initRenderer = () => {
  canvas = document.getElementById('c');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(animate);
}

// 更新尺寸
const updateSize = () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
  }
}

// 动画循环
const animate = () => {
  updateSize();
  canvas.style.transform = `translateY(${window.scrollY}px)`;

  renderer.setClearColor(0xffffff);
  renderer.setScissorTest(false);
  renderer.clear();

  renderer.setClearColor(0xe0e0e0);
  renderer.setScissorTest(true);

  sceneItems.value.forEach(item => {
    const element = item.getContainer();
    const rect = element.getBoundingClientRect();
    // console.log(rect);
    if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
      rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
      return;
    }

    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = renderer.domElement.clientHeight - rect.bottom;

    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);

    const camera = item.getCamera();
    // console.log(camera);
    // console.log(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    item.update();
    renderer.render(item.getScene(), camera);
  })
}


/**
 * 打开通讯
 */
const openWebSocket = () => {
  try {
    socket = new WebSocket(wsUrl);

    socket.addEventListener('open', (event) => {
      console.log('WebSocket连接已打开');
      socket.send('你好,服务器!');
    });

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', () => console.log('WebSocket连接已关闭'));
    socket.addEventListener('error', (e) => console.log('WebSocket连接出错', e));

  } catch (error) {
    console.error('WebSocket连接错误:', error);
  }
};

/**
 * 收到消息
 * @param event 事件对象
 */
const handleMessage = (event) => {
  try {
    console.log('收到来自服务器的消息: ', event.data);
  } catch (error) {
    console.error('WebSocket message:', error);
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
#content {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
  padding: 2 0 0 0;
}

#c {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
}
</style>