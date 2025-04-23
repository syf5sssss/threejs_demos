import { Tween, Group } from '@tweenjs/tween.js';
import * as THREE from 'three';

/**
 * 页面移动控制
 * @param {OrbitControls} controls 轨道控制
 * @param {{x:0,y:0,z:0}} target 控制参数 {x:0,y:0,z:0}
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_control(controls, target, tweenGroup, duration, iscontrol) {
    const currentTarget = {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z
    };
    const targetTween = new Tween(currentTarget, tweenGroup)
        .to(target, duration)
        .onStart(() => {
            if (controls) {
                controls.enabled = false;
            }
        })
        .onUpdate(() => {
            controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
        }).onComplete(() => {
            if (controls) {
                controls.enabled = iscontrol;
            }
        });
    targetTween.start();
}
/**
 * 相机缩放页面
 * @param {Camera} camera 相机
 * @param {{ value: 1 }} target 缩放参数 { value: 1 }
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_zoom(camera, target, tweenGroup, duration, controls, iscontrol) {
    const currentZoom = { value: camera.zoom };
    const zoomTween = new Tween(currentZoom, tweenGroup)
        .to(target, duration)
        .onStart(() => {
            if (controls) {
                controls.enabled = false;
            }
        })
        .onUpdate(() => {
            camera.zoom = currentZoom.value;
            camera.updateProjectionMatrix();
        }).onComplete(() => {
            if (controls) {
                controls.enabled = iscontrol;
            }
        });
    zoomTween.start();
}
/**
 * 页面中的相机移动
 * @param {Camera} camera 相机
 * @param {Vector3} target 相机目标位置 new THREE.Vector3(0, 0, 0)
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_camera_move(camera, target, tweenGroup, duration, controls, iscontrol) {
    const cameraTween = new Tween(camera.position, tweenGroup)
        .to(target, duration)
        .onStart(() => {
            if (controls) {
                controls.enabled = false;
            }
        })
        .onUpdate(() => {
            camera.position.set(camera.position.x, camera.position.y, camera.position.z);
            // camera.lookAt(center);
            // controls.update();
        }).onComplete(() => {
            if (controls) {
                controls.enabled = iscontrol;
            }
        });
    cameraTween.start();
}

/**
 * 页面中的相机移动
 * @param {Camera} camera 相机
 * @param {Vector3} target 相机目标位置 new THREE.Vector3(0, 0, 0)
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Function} onCompleteCallback 动画完成后的回调函数
 * @param {Object} controls 相机控制器
 */
export function tw_camera_move_callback(camera, target, tweenGroup, duration, onCompleteCallback, controls, iscontrol) {
    const cameraTween = new Tween(camera.position, tweenGroup)
        .to(target, duration)
        .onStart(() => {
            if (controls) {
                controls.enabled = false;
            }
        })
        .onUpdate(() => {
            camera.position.set(camera.position.x, camera.position.y, camera.position.z);
        })
        .onComplete(() => {
            if (controls) {
                controls.enabled = iscontrol;
            }
            if (typeof onCompleteCallback === 'function') {
                onCompleteCallback();
            }
        });
    cameraTween.start();
}
//使用示例
// tw_camera_move(camera, p, tweenGroup, props.twDuration, () => {
//     controls.update();
// });

/**
 * 页面中的相机朝向
 * @param {Camera} camera 相机
 * @param {Vector3} target 相机目标朝向 new THREE.Vector3(0, 0, 0)
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_camera_lookat(camera, target, tweenGroup, duration, controls, iscontrol) {
    // 记录当前相机的朝向
    const currentQuaternion = camera.quaternion.clone();
    const targetMatrix = new THREE.Matrix4();
    targetMatrix.lookAt(camera.position, target, camera.up);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

    // 检查是否需要反转目标四元数以获得最短路径
    if (currentQuaternion.dot(targetQuaternion) < 0) {
        // targetQuaternion.negate();//这个函数报错,找不到，下面是手动实现
        targetQuaternion.x *= -1;
        targetQuaternion.y *= -1;
        targetQuaternion.z *= -1;
        targetQuaternion.w *= -1;
    }
    // 创建一个对象来保存中间状态的四元数
    const quaternionObject = {
        x: currentQuaternion.x,
        y: currentQuaternion.y,
        z: currentQuaternion.z,
        w: currentQuaternion.w
    };

    // 创建 Tween 来动画四元数
    const cameraTween = new Tween(quaternionObject, tweenGroup)
        .to({
            x: targetQuaternion.x,
            y: targetQuaternion.y,
            z: targetQuaternion.z,
            w: targetQuaternion.w
        }, duration)
        .onStart(() => {
            if (controls) {
                controls.enabled = false;
            }
        })
        .onUpdate(() => {
            // console.log(quaternionObject);
            camera.quaternion.set(
                quaternionObject.x,
                quaternionObject.y,
                quaternionObject.z,
                quaternionObject.w
            );
        }).onComplete(() => {
            if (controls) {
                controls.enabled = iscontrol;
            }
        });

    cameraTween.start();
}
/**
 * 模型集合旋转
 * @param {Object[]} models 模型集合
 * @param {{x: 0, y:0, z: 0}} target 旋转参数 x: Math.PI / 180 * 0, y: Math.PI / 180 * 0, z: Math.PI / 180 * 0
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_models_rotation(models, target, tweenGroup, duration, controls, iscontrol) {
    if (models && models.length > 0) {
        models.forEach((m) => {
            const currentRotation = {
                x: m.rotation.x,
                y: m.rotation.y,
                z: m.rotation.z
            };

            // 创建补间动画
            const rotationTween = new Tween(currentRotation, tweenGroup)
                .to(target, duration)
                .onStart(() => {
                    if (controls) {
                        controls.enabled = false;
                    }
                })
                .onUpdate(() => {
                    // 将补间值同步到模型
                    m.rotation.set(
                        currentRotation.x,
                        currentRotation.y,
                        currentRotation.z
                    );
                    // 强制更新模型矩阵
                    m.updateMatrixWorld(true);
                }).onComplete(() => {
                    if (controls) {
                        controls.enabled = iscontrol;
                    }
                });
            rotationTween.start();
        });
    }
}

/**
 * 模型旋转
 * @param {Object} model模型
 * @param {{x: 0, y:0, z: 0}} target 旋转参数 x: Math.PI / 180 * 0, y: Math.PI / 180 * 0, z: Math.PI / 180 * 0
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_model_rotation(model, target, tweenGroup, duration, controls, iscontrol) {
    if (model) {
        const currentRotation = {
            x: model.rotation.x,
            y: model.rotation.y,
            z: model.rotation.z
        };

        // 创建补间动画
        const rotationTween = new Tween(currentRotation, tweenGroup)
            .to(target, duration)
            .onStart(() => {
                if (controls) {
                    controls.enabled = false;
                }
            })
            .onUpdate(() => {
                // 将补间值同步到模型
                model.rotation.set(
                    currentRotation.x,
                    currentRotation.y,
                    currentRotation.z
                );
                // 强制更新模型矩阵
                model.updateMatrixWorld(true);
            }).onComplete(() => {
                if (controls) {
                    controls.enabled = iscontrol;
                }
            });
        rotationTween.start();
    }
}

/**
 * 模型集合移动
 * @param {Object[]} models 模型集合[]
 * @param {Number} index 模板序号
 * @param {Vector3} target 模板目标位置 new THREE.Vector3(0, 0, 0)
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_models_move(models, index, target, tweenGroup, duration, controls, iscontrol) {
    if (models && models.length > 0) {
        const mi = models[index];
        const offsets = models.map(m => {
            return new THREE.Vector3(
                m.position.x - mi.position.x,
                m.position.y - mi.position.y,
                m.position.z - mi.position.z
            );
        });
        new Tween(mi.position, tweenGroup)
            .to(target, duration)
            .onStart(() => {
                if (controls) {
                    controls.enabled = false;
                }
            })
            .onUpdate(() => {
                models.forEach((m, index) => {
                    m.position.set(
                        mi.position.x + offsets[index].x,
                        mi.position.y + offsets[index].y,
                        mi.position.z + offsets[index].z
                    );
                });
            }).onComplete(() => {
                if (controls) {
                    controls.enabled = iscontrol;
                }
            }).start();
    }
}
/**
 * 模型移动
 * @param {Object} model 模型
 * @param {Vector3} target 目标位置 new THREE.Vector3(0, 0, 0)
 * @param {Group} tweenGroup 控制群体
 * @param {Number} duration 持续时间
 * @param {Object} controls 相机控制器
 */
export function tw_model_move(model, target, tweenGroup, duration, controls, iscontrol) {
    new Tween(model.position, tweenGroup)
        .to(target, duration)
        .onStart(() => {
            if (controls) {
                controls.enabled = false;
            }
        })
        .onUpdate(() => {
            model.position.set(
                mi.position.x,
                mi.position.y,
                mi.position.z
            );
        }).onComplete(() => {
            if (controls) {
                controls.enabled = iscontrol;
            }
        }).start();
}

/**
 * 模型多步骤移动
 * @param {Object} model - 要移动的模型
 * @param {Array<Object>} steps - 移动步骤数组，每个步骤包含目标位置和持续时间 { target: new THREE.Vector3(0, 0, 0), duration: 1000 }
 * @param {Group} tweenGroup - 控制群体
 * @param {Object} controls 相机控制器
 */
export function tw_model_multi_move(model, steps, tweenGroup, controls, iscontrol) {
    let currentTween = null;
    // 遍历每个移动步骤
    steps.forEach((step, index) => {
        const { target, duration } = step;
        // 创建当前步骤的 Tween 对象
        const tween = new Tween(model.position, tweenGroup)
            .to(target, duration)
            .onStart(() => {
                if (controls) {
                    controls.enabled = false;
                }
            })
            .onUpdate(() => {
                model.position.set(
                    model.position.x,
                    model.position.y,
                    model.position.z
                );
            }).onComplete(() => {
                if (controls) {
                    controls.enabled = iscontrol;
                }
            });
        // 如果不是第一个步骤，将当前 Tween 连接到上一个 Tween 的完成事件之后
        if (currentTween) {
            currentTween.onComplete(() => {
                tween.start();
            });
        } else {
            // 第一个步骤直接启动
            tween.start();
        }
        // 更新当前 Tween 为当前步骤的 Tween
        currentTween = tween;
    });
}

