import MapCenter from "./map-center";
import ViewControl from "./view-control";
import GameOrder from "./game-order";
import GameConst from "./game-const";
import Tween from "./tween";

class GameMain {
    root = null;
    el = null;

    width = 1024;
    height = 768;

    isInit = false;

    myModel = null;
    myId = 0;

    modelMap = {};
    mixerMap = {};
    meshObject = new THREE.Object3D();

    sTargetId = 0;
    preTime = 0;

    constructor() {
        window.gameInstance = this;
    }

    initScene(root) {
        this.root = root;
        this.myId = root.id;
        this._initSRC();
        this._initControls();
        this._start();
        this._initDom(root.$el);
    }

    addPlayerData(data) {
        this.root.addFriends([data]);
        this._newPlayer(data, model => {
            model.position.x = data.x;
            model.position.z = data.z;

            if (data.id === this.myId) {
                MapCenter.loadMapData(data.mapId || 0)
                    .then(mesh2es => {
                        const object = this.meshObject;
                        mesh2es.forEach(meshes => {
                            meshes.forEach(mesh => {
                                object.add(mesh);
                            });
                        });
                        const scene = this.scene;
                        scene.add(object);
                        scene.add(model);
                        this.myModel = model;
                        this.viewControl.setPoint(model.position);
                        this._initHeartBeat();
                    });
            } else {
                const scene = this.scene;
                scene.add(model);
            }
        });
    }

    addPlayerDatas(datas = []) {
        this.root.addFriends(datas);
        const scene = this.scene;
        datas.forEach(data => {
            if (data.id === this.myId) {
                return;
            }
            if (this.getPlayer(data.id)) {
                return;
            }
            this._newPlayer(data, model => {
                model.position.x = data.x;
                model.position.z = data.z;
                scene.add(model);
            })
        })
    }

    parsePersonMsg(order) {
        this.root.addPersonMsg(order);
    }

    _start() {
        console.log("GameScene start()")
        this.isInit = true;
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.animate = this.animate.bind(this);
        this.animateTest = this.animateTest.bind(this);
        this.currentAnimate = this.animateTest;
        this.currentAnimate(0);
        setTimeout(() => {
            this.currentAnimate = this.animate;
        }, 300);
    }

    _initHeartBeat() {
        this.heartBeat = setInterval(() => {
            const selfId = this.myModel.userData.id,
                order = new GameOrder(selfId, GameConst.CG_Person);
            order.setValue(GameConst.CG_Person,
                selfId,
                GameConst.CT_Const,
                GameConst.CT_Const_Heart)
            this.root.sendOrder(order);
        }, 10000);
    }

    _initSRC() {
        const scene = new THREE.Scene();
        // scene.fog = new THREE.Fog(0x444444, 20, 100);
        this.scene = scene;

        const renderer = new THREE.WebGLRenderer({ antialias: true, autoClear: true });
        renderer.shadowMap.enabled = true;
        this.renderer = renderer;

        const camera = new THREE.PerspectiveCamera(45);
        camera.position.set(0, 5, 20);
        this.camera = camera;

        window.addEventListener("resize", e => {
            const width = this.el.clientWidth;
            const height = this.el.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);

            this.width = width;
            this.height = height;
        })

        // const gridHelper = new THREE.GridHelper(200, 100, 0x0000ff, 0x808080);
        // scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper(100);
        scene.add(axesHelper);
    }

    _initControls() {
        const viewControl = new ViewControl(this.camera);
        viewControl.setObjects(this.scene.children);
        viewControl.setCall(ViewControl.CALL_UP, (e, type) => {
            let object = e.object;
            if (type === 0) {
                // const model = this.modelMap[this.myModel.userData.id];
                const selfId = this.myModel.userData.id,
                    order = new GameOrder(selfId, GameConst.CG_Person);
                order.setValue(GameConst.CG_Person,
                    selfId,
                    GameConst.CT_Action,
                    GameConst.CT_Action_Move,
                    e.point)
                this.root.sendOrder(order);
            } else {
                if (object.name === "floor") return;
                while (object.name !== "RootNode") {
                    object = object.parent;
                }
                if (object !== this.myModel) {
                    this.playerPanel.showPlayer(object.userData);
                    this.sTargetId = object.userData.id;
                } else {
                    this.sTargetId = 0;
                }
            }
        });
        this.viewControl = viewControl;
    }

    getPlayer(id) {
        return this.modelMap[id];
    }

    removePlayer(id) {
        if (id === this.myModel.userData.id)
            return;
        const model = this.modelMap[id];
        if (model) {
            this.scene.remove(model);
            delete this.modelMap[id];
        }
    }

    newChonglou(model, mixColor, delay) {
        // 0  1  2  3  4
        // 9  8  7  6  5
        const vertices = [
            new THREE.Vector3(-1, 0.1, 0),
            new THREE.Vector3(-0.5, 0.1, 0.75),
            new THREE.Vector3(0, 0.1, 1),
            new THREE.Vector3(0.5, 0.1, 0.75),
            new THREE.Vector3(1, 0.1, 0),
            new THREE.Vector3(1, -0.1, 0),
            new THREE.Vector3(0.5, -0.1, 0.75),
            new THREE.Vector3(0, -0.1, 1),
            new THREE.Vector3(-0.5, -0.1, 0.75),
            new THREE.Vector3(-1, -0.1, 0)
        ];

        const faces = [
            new THREE.Face3(0, 1, 9),
            new THREE.Face3(1, 8, 9),
            new THREE.Face3(1, 2, 8),
            new THREE.Face3(2, 7, 8),
            new THREE.Face3(2, 3, 7),
            new THREE.Face3(3, 6, 7),
            new THREE.Face3(3, 4, 6),
            new THREE.Face3(4, 5, 6),
        ];

        const geometry = new THREE.Geometry();
        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeFaceNormals();//计算法向量，会对光照产生影响

        const textureLoader = new THREE.TextureLoader(),
            planeMap = textureLoader.load(require("@/assets/textures/tail.png"));
        // planeMap.repeat.set(25, 25);
        planeMap.wrapS = THREE.RepeatWrapping;
        planeMap.wrapT = THREE.RepeatWrapping;

        const mapV = [
            new THREE.Vector2(0, 1),
            new THREE.Vector2(0.25, 1),
            new THREE.Vector2(0.5, 1),
            new THREE.Vector2(0.75, 1),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(0.75, 0),
            new THREE.Vector2(0.5, 0),
            new THREE.Vector2(0.25, 0),
            new THREE.Vector2(0, 0)
        ]
        geometry.faceVertexUvs[0].push([mapV[0], mapV[1], mapV[9]])
        geometry.faceVertexUvs[0].push([mapV[1], mapV[8], mapV[9]])
        geometry.faceVertexUvs[0].push([mapV[1], mapV[2], mapV[8]])
        geometry.faceVertexUvs[0].push([mapV[2], mapV[7], mapV[8]])
        geometry.faceVertexUvs[0].push([mapV[2], mapV[3], mapV[7]])
        geometry.faceVertexUvs[0].push([mapV[3], mapV[6], mapV[7]])
        geometry.faceVertexUvs[0].push([mapV[3], mapV[4], mapV[6]])
        geometry.faceVertexUvs[0].push([mapV[4], mapV[5], mapV[6]])
        geometry.uvsNeedUpdate = true

        const material = new THREE.MeshLambertMaterial({
            map: planeMap,
            color: mixColor || 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            // combine: THREE.MixOperation
        })
        material.opacity = 2

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.1;
        mesh.scale.set(2.5, 2.5, 2.5)

        const newModel = new THREE.Object3D()
        newModel.add(mesh)
        this.scene.add(newModel)

        let chonglouY = -0.01
        Tween.newTween({ v: 0 })
            .to({ v: -360 }, 3000)
            .onUpdate(v => {
                newModel.position.copy(model.position)
                mesh.rotateY(-Math.PI / 50);
                // mesh.rotateX(-Math.PI / 40);
                // mesh.rotateZ(-Math.PI / 30);
                mesh.position.y += chonglouY
                if (mesh.position.y < 0.3) {
                    chonglouY = Math.abs(chonglouY)
                } else if (mesh.position.y > 1.8) {
                    chonglouY = -Math.abs(chonglouY)
                }
            })
            .repeat(Infinity)
            .start(delay || 0);

        // const spriteMaterial = new THREE.SpriteMaterial({
        //     map: new THREE.TextureLoader().load(require("@/assets/textures/sun.png")),
        //     color: mixColor || 0xffffff,
        //     transparent: true,
        //     blending: THREE.AdditiveBlending,
        //     combine: THREE.MixOperation
        // });
        // const sprite = new THREE.Sprite(spriteMaterial);
        // sprite.scale.set(0.3, 0.3);
        // sprite.position.set(-1, 0, 0)
        // mesh.add(sprite)

        // model.add(mesh)
    }

    newSprites8(model) {
        for (let i = 0; i < 8; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: new THREE.TextureLoader().load(require("@/assets/textures/cloud_002.png")),
                color: 0xffffff,
                blending: THREE.AdditiveBlending
            });
            spriteMaterial.transparent = true;
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 2.0 + Math.random() * 0.5;
            sprite.material.opacity = 0.6;
            sprite.scale.set(0.6, 0.6 * 1.5);
            sprite.rotation.set(0, 0, Math.PI * (i % 2));

            Tween.newTween({ v: 1 })
                .to({ v: 100 }, 2400)
                .onUpdate(ratio => {
                    const v = 4 * ratio + 0.6
                    sprite.scale.set(v, v * 1.5);
                    sprite.material.opacity = 0.6 - (sprite.scale.x - 0.3) / 5 * 0.6;
                })
                .repeat(Infinity)
                .start(300 * i);

            model.add(sprite)
        }
    }

    newLigthning(model) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load(require("@/assets/textures/lightning_001.png")),
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.y = 2.0 + Math.random() * 1;
        sprite.scale.set(5, 5);
        sprite.material.opacity = 0;

        Tween.newTween({ v: 1 })
            .to({ v: 100 }, 1400)
            .onUpdate(ratio => {
                sprite.material.opacity = 0.8 * (1 - ratio);
            })
            .delay(5000)
            .repeat(Infinity)
            .start();

        model.add(sprite)
    }

    newSimplePlayer(data, call) {
        const model = new THREE.Object3D();
        model.userData = data;
        this.modelMap[data.id] = model;

        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x148acf });
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.6, 10, 10),
            sphereMaterial
        );
        sphere.position.y = 1.5
        model.add(sphere)
        const randomNum = Math.random()
        if (randomNum < 0.33) {
            this.newChonglou(model)
            this.newChonglou(model, 0xff0000, 2500)
            this.newChonglou(model, 0x0000ff, 5000)
        } else if (randomNum < 0.66) {
            this.newSprites8(model)
        } else {
            this.newLigthning(model)
        }
        call(model);
    }

    _newPlayer(data, call) {
        // this.newSimplePlayer(data, call)

        // this.newSprites8(model)
        // this.newChonglou(model)
        // this.newLigthning(model)

        // "models/robot.glb"
        new THREE.GLTFLoader()
            .load("models/dandan/scene.gltf", gltf => {
                window.gltf = gltf
                const model = gltf.scene.children[0];
                model.scale.set(0.05, 0.05, 0.05)
                model.userData = data;
                model.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });

                this.modelMap[data.id] = model;
                this.newChonglou(model)
                // this.newChonglou(model, 0xff0000, 3000)
                // this.newChonglou(model, 0x0000ff, 6000)

                call(model);
            });
    }

    _initDom(el) {
        if (!this.isInit) {
            console.log("_initDom() should be called after _initSRC()");
            return;
        }
        const width = el.clientWidth,
            height = el.clientHeight,
            renderer = this.renderer,
            camera = this.camera,
            domElement = renderer.domElement;

        renderer.setSize(width, height);
        if (domElement.parentElement) {
            domElement.remove();
        }
        el.appendChild(domElement);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const statsEl = this.stats.domElement;
        if (statsEl.parentElement) {
            statsEl.remove();
        }
        el.appendChild(statsEl);

        this.el = el;
        this.width = width;
        this.height = height;
        // this.composer.setSize(width, height);

        // window.addEventListener('visibilitychange', e => {
        //     if (document.visibilityState === 'hidden') {}
        // })
    }

    animateTest(time) {
        this.preTime = time;
        this.handle = requestAnimationFrame(this.currentAnimate);
    }

    animate(time) {
        const timeStep = time - this.preTime;
        this.preTime = time;
        this.isInit && (this.handle = requestAnimationFrame(this.currentAnimate));
        // this.isInit && setTimeout(this.animate, 1000 / 12);

        Tween.update(timeStep);
        this.viewControl.update();
        this.stats.update();

        const delta = this.clock.getDelta(),
            o = this.mixerMap;
        for (const key in o) {
            if (o.hasOwnProperty(key)) {
                o[key].update(delta);
            }
        }

        // this.composer.render();
        this.renderer.render(this.scene, this.camera);
    }

    release() {
        cancelAnimationFrame(this.handle);
        clearInterval(this.heartBeat)
        Tween.release();

        this.isInit = false;
        if (this.renderer) {
            this.renderer.clear(true, true, true);
            this.renderer.domElement.remove();
            this.renderer.dispose();

            this.renderer = null;
            this.scene = null;
        }
        this.el = null;

        window.location.reload();
    }
}

export default new GameMain();