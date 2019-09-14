class MapManager {

    mapId = -1;
    meshes = [];

    width = 200;
    height = 200;
    hUnit = 0.5;
    mapMatrix = [];

    constructor() {
    }

    loadMapData(mapId) {
        this.mapId = mapId;

        const promises = [this._initLights(), this._initMeadow()];
        return Promise.all(promises);
    }

    resetFloor(scene) {
        this.floor = scene.getObjectByName("floor");
    }

    _initLights() {
        return new Promise(function (resolve, reject) {
            const sunLight = new THREE.DirectionalLight(0x999999),
                shadow = sunLight.shadow,
                camera = shadow.camera;

            sunLight.name = "sunLight";
            sunLight.castShadow = false || 0;
            shadow.mapSize.width = 2000;
            shadow.mapSize.height = 2000;
            camera.near = 0.1;
            camera.far = 300;
            camera.top = 100;
            camera.bottom = -100;
            camera.right = 100;
            camera.left = -100;

            const position = sunLight.position,
                radians = { v: -Math.PI / 2 };
            position.set(100, 300, 0);
            // new TWEEN.Tween(radians)
            //     .to({ v: Math.PI * 4 / 3 }, 20 * 1000)
            //     .repeat(Infinity)
            //     .onUpdate(() => {
            //         position.set(Math.sin(radians.v) * 100, Math.cos(radians.v) * 100, 0);
            //     })
            //     .start();

            const meshes = [];
            meshes.push(new THREE.AmbientLight(0x666666));
            meshes.push(sunLight);

            // const sunLightHelper = new THREE.DirectionalLightHelper(sunLight, 0.1);
            // meshes.push(sunLightHelper);

            // const cameraHelper = new THREE.CameraHelper(sunLight.shadow.camera);
            // meshes.push(cameraHelper);
            resolve(meshes);
        });
    }

    _initMeadow() {
        return new Promise(function (resolve, reject) {
            const textureLoader = new THREE.TextureLoader(),
                planeMap = textureLoader.load(require("@/assets/textures/meadow.jpeg"));
            planeMap.repeat.set(25, 25);
            planeMap.wrapS = THREE.RepeatWrapping;
            planeMap.wrapT = THREE.RepeatWrapping;

            const geometry = new THREE.PlaneBufferGeometry(200, 200, 200, 200),
                material = new THREE.MeshLambertMaterial({ map: planeMap }),
                mesh = new THREE.Mesh(geometry, material);
            material.metalness = 0;
            mesh.rotateX(-Math.PI / 2);
            mesh.receiveShadow = false || 0;
            mesh.position.y = -0.01;
            mesh.name = "floor";
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();

            // geometry.computeVertexNormals();

            resolve([mesh]);
        });

    }

    updateWalkingHeight(position) {
        const floor = this.floor;
        if (!floor) return;
        const w = this.width,
            h = this.height;
        // floor geometry array 从二维坐标轴(y↑→x)第三象限开始,依次→↓排序
        const x = Math.floor(position.x + w / 2),
            z = Math.floor(position.z + h / 2),
            i = ((w + 1) * z + x) * 3, // w个格子共有(w+1)个点
            i2 = i + (w + 1) * 3,
            vertices = floor.geometry.attributes.position.array;
        // console.log(x, z, i, i2);
        // console.log(vertices.slice(i, i + 6), vertices.slice(i2, i2 + 6));
        // return 0;
        // floor是通过旋转-90后作为地面,故z轴为水平高度
        const x0 = vertices[i],
            // y0 = vertices[i + 1],
            z0 = vertices[i + 2],
            // x1 = vertices[i + 3],
            // y1 = vertices[i + 4],
            z1 = vertices[i + 5],
            // x2 = vertices[i2],
            // y2 = vertices[i2 + 1],
            z2 = vertices[i2 + 2],
            // x3 = vertices[i2 + 3],
            // y3 = vertices[i2 + 4],
            z3 = vertices[i2 + 5];

        const nZ = position.z - Math.floor(position.z),
            nX = position.x - Math.floor(position.x);
        // 标记是否为左上角的三角形
        let ltFlag = nX === 0;
        if (!ltFlag) {
            ltFlag = 1 - nZ > nX;
        }
        // console.log("\n" + ltFlag, nX, nZ);
        // 基于左下角为基准
        let y = z2;
        if (ltFlag) {
            const y02 = z0 - z2,
                y10 = z1 - z0;
            y += (1 - nZ) * y02;
            y += nX * y10;
            // console.log(y02, y10, y);
        } else {
            const y32 = z3 - z2,
                y13 = z1 - z3;
            y += nX * y32;
            y += (1 - nZ) * y13;
            // console.log(y32, y13, y);
        }
        // console.log(y)
        position.y = y;
        return y;
    }

    release() {
    }
}

export default new MapManager();