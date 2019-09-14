import MapCenter from "./map-center";
import ViewControl from "./view-control";
import GameOrder from "./game-order";

class GameMain {
    root = null;
    el = null;

    width = 1024;
    height = 768;

    isInit = false;

    myModel = null;
    modelMap = {};
    mixerMap = {};
    meshObject = new THREE.Object3D();

    sTargetId = 0;

    constructor() {
        window.gameInstance = this;
    }

    init(data, root) {
        this.root = root;
        console.log("data.mapId", data.mapId)
        MapCenter.loadMapData(data.mapId)
            .then(mesh2es => {
                console.log(mesh2es);

                this._newPlayer(data, model => {
                    const object = this.meshObject;
                    mesh2es.forEach(meshes => {
                        meshes.forEach(mesh => {
                            object.add(mesh);
                        });
                    });
                    const scene = this._initSRC();
                    scene.add(model);
                    scene.add(object);

                    this.myModel = model;
                    this._initControls(model.position);
                    this._start();
                });
            });
    }

    _start() {
        console.log("GameScene start()")
        this.isInit = true;
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.animate = this.animate.bind(this);
        this.animate(0);
    }

    _initSRC() {
        let scene = this.scene;
        if (scene) {
            return scene;
        } else {
            scene = new THREE.Scene();
            // scene.fog = new THREE.Fog(0x444444, 20, 100);
        }
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
        // this.scene.add(gridHelper);
        // const axesHelper = new THREE.AxesHelper(100);
        // this.scene.add(axesHelper);
        return scene;
    }

    _initControls(position) {
        const viewControl = new ViewControl(this.camera);
        viewControl.setObjects(this.scene.children);
        viewControl.setPoint(this.myModel.position);
        viewControl.setCall(ViewControl.CALL_UP, (e, type) => {
            let object = e.object;
            if (type === 0) {
                // const model = this.modelMap[this.myModel.userData.id];

                this.root.sendOrder(
                    new GameOrder(this.myModel.userData.id)
                        .setValue(0, 0, 0, 3000, e.point)
                );
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

    dealOrder(order) {
        if (order.id === 3000) {
            const position = this.myModel.position,
                data = order.data;
            position.x = data.x;
            position.z = data.z;
        }
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
        new THREE.GLTFLoader()
            .load("models/robot.glb", gltf => {
                const model = gltf.scene.children[0];
                model.userData = data;
                model.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });

                this.modelMap[data.id] = model;
                call(model);
            });
    }

    initDom(el, call) {
        if (!this.isInit) {
            if (!this.initCount) this.initCount = 0;
            this.initCount++;
            if (this.initCount > 20) {
                call(false);
                return;
            }
            setTimeout(() => {
                this.initDom(el, call);
            }, 300);
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

        call(true);
    }

    animate(time) {
        this.isInit && (this.handle = requestAnimationFrame(this.animate));
        // this.isInit && setTimeout(this.animate, 1000 / 12);

        TWEEN.update();
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