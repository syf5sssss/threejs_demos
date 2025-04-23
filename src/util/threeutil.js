import * as THREE from 'three';

/**
 * 清空场景中所有模型
 * @param {Scene} scene 场景对象
 */
export function clear_scene(scene) {
    if (scene && scene.children) {
        const children = [...scene.children];
        children.forEach(child => {
            if (!(child instanceof THREE.Light) && !(child instanceof THREE.AxesHelper)) {
                scene.remove(child);
                // 如果模型有几何体和材质，需要释放资源
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }
}

/**
 * 找到根模型
 * @param {Object} object 模型
 * @returns 最终的根模型
 */
export function findRoot(object) {
    let current = object;
    while (current.parent) {
        current = current.parent;
    }
    return current;
};

/**
 * 清空场景中的模型集合
 * @param {Scence} scene 场景
 * @param {Array} list 模型集合
 */
export function clear_models(scene, list) {
    list.forEach((li) => {
        scene.remove(li);
        // 释放小球的几何体和材质资源
        if (li.geometry) {
            li.geometry.dispose();
        }
        if (li.material) {
            if (Array.isArray(li.material)) {
                li.material.forEach(material => {
                    if (material) {
                        material.dispose();
                    }
                });
            } else {
                li.material.dispose();
            }
        }
    });
}