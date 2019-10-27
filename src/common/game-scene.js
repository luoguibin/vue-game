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

    initPlayerData(data) {
        this._newPlayer(data, model => {
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
        const scene = this.scene;
        datas.forEach(data => {
            if (data.id === this.myId) {
                return;
            }
            if (this.getPlayer(data.id)) {
                return;
            }
            this._newPlayer(data, model => {
                scene.add(model);
            })
        })
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

    addPlayer(data) {
        if (!this.scene) {
            setTimeout(() => {
                this.addPlayer(data);
            }, 300);
            return;
        }
        if (data.id === this.myModel.userData.id)
            return;
        this.removePlayer(data.id);
        this._newPlayer(data, model => {
            this.scene.add(model);
        });
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

    _newPlayer(data, call) {
        const model = new THREE.Object3D();
        model.userData = data;
        this.modelMap[data.id] = model;

        for (let i = 0; i < 8; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: new THREE.TextureLoader().load(require("@/assets/textures/cloud_002.png")),
                color: 0xffffff,
                blending: THREE.AdditiveBlending
            });
            spriteMaterial.transparent = true;
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 2.0 + Math.random() * 1;
            sprite.material.opacity = 0.8;
            sprite.scale.set(0.3, 0.3 * 1.5);
            // sprite.rotation.set(0, 0, 0)

            Tween.newTween({ v: 1 })
                .to({ v: 100 }, 2400)
                .onUpdate(ratio => {
                    const v = 5 * ratio + 0.3
                    sprite.scale.set(v, v * 1.5);
                    sprite.material.opacity = 0.8 - (sprite.scale.x - 0.3) / 5 * 0.8;
                })
                .repeat(Infinity)
                .start(300 * i);

            model.add(sprite)
        }
        call(model);

        // new THREE.GLTFLoader()
        //     .load("models/robot.glb", gltf => {
        //         const model = gltf.scene.children[0];
        //         model.userData = data;
        //         model.traverse(child => {
        //             if (child.isMesh) {
        //                 child.castShadow = true;
        //             }
        //         });

        //         this.modelMap[data.id] = model;
        //         call(model);
        //     });
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