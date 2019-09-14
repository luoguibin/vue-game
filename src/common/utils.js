var initParticle = function (particle, delay) {
    var particle = this instanceof THREE.Sprite ? this : particle;
    var delay = delay !== undefined ? delay : 0;

    particle.position.set(0, 10, 0);
    particle.scale.x = particle.scale.y = Math.random() * 1 + 0.5;
    // particle.material.opacity = 1;
    new TWEEN.Tween(particle)
        .delay(delay)
        .to({}, 3000)
        .onComplete(initParticle)
        .start();

    new TWEEN.Tween(particle.position)
        .delay(delay)
        .to({ x: Math.random() * 3 - 1.5, y: Math.random() * 3 - 1.5 + 10, z: Math.random() * 3 - 1.5 }, 3000)
        .start();

    new TWEEN.Tween(particle.scale)
        .delay(delay)
        .to({ x: 0.01, y: 0.01 }, 3000)
        .start();
    // new TWEEN.Tween(particle.material)
    //     .delay(delay)
    //     .to({opacity: 0}, 3000)
    //     .start();
}

var newSpriteCanvas = function (colorStr) {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    var context = canvas.getContext('2d');
    context.fillStyle = "rgba(255, 255, 255, 0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.15, colorStr ? colorStr : `rgba(${THREE.Math.randInt(0, 255)},${THREE.Math.randInt(0, 255)},${THREE.Math.randInt(0, 255)},1)`);
    gradient.addColorStop(0.4, 'rgba(20,20,20,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
}

var addSprites = function (mesh, offSet) {
    const colors = ["rgb(255, 136, 136)", "rgb(255, 255, 255)", "rgb(136, 255, 136)"],
        length = colors.length;
    for (let i = 0; i < length; i++) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(newSpriteCanvas(colors[i])),
            blending: THREE.AdditiveBlending
        });
        spriteMaterial.transparent = true;
        const sprite = new THREE.Sprite(spriteMaterial);
        mesh.add(sprite);

        const position = sprite.position,
            rObj0 = { v: 0, a: Math.PI * 2 / 3 * i },
            rObj1 = { v: 0, a: Math.PI * 2 / 3 * i + 1 };
        new TWEEN.Tween(rObj0)
            .to({ v: Math.PI * 2 }, 5000)
            .repeat(Infinity)
            .start();
        new TWEEN.Tween(rObj1)
            .to({ v: Math.PI * 2 }, 14500)
            .onUpdate(() => {
                position.x = offSet.x + offSet.m * Math.sin(rObj0.v + rObj0.a) * Math.cos(rObj1.v + rObj1.a);
                position.y = offSet.y + offSet.m * Math.sin(rObj0.v + rObj0.a) * Math.sin(rObj1.v + rObj1.a);
                position.z = offSet.z + offSet.m * Math.cos(rObj0.v + rObj0.a);
            })
            .repeat(Infinity)
            .start()
    }

    for (let i = 0; i < 8; i++) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.ImageUtils.loadTexture(require("@/assets/textures/cloud_002.png")),
            color: 0xffffff,
            blending: THREE.AdditiveBlending
        });
        spriteMaterial.transparent = true;
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.y = 2.0 + Math.random() * 1;
        sprite.material.opacity = 0.8;
        sprite.scale.set(1, 1);
        // sprite.scale.set(5, 5);

        new TWEEN.Tween(sprite.scale)
            .to({ x: 7, y: 7 }, 2000)
            .delay(300 * i)
            .onUpdate(() => {
                // 3-5 => 0.3-0
                sprite.material.opacity = 0.8 - (sprite.scale.x - 1) / 6 * 0.8;
            })
            .repeat(Infinity)
            // .yoyo(true)
            .start();

        mesh.add(sprite)
    }
}

export { initParticle, newSpriteCanvas, addSprites };


////////////////////////////////////////
////////////////////////////////////////
// for (let i = 0; i < 3; i++) {
//     const texture = new THREE.TextureLoader().load(require("@/assets/textures/crate.gif")),
//         geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5),
//         materia = new THREE.MeshStandardMaterial({ map: texture });

//     if (i % 2 === 0) {
//         geometry.faceVertexUvs[0][0][0].set(0, 3.6);
//         geometry.faceVertexUvs[0][0][2].set(3.6, 3.6);
//         geometry.faceVertexUvs[0][1][1].set(3.6, 0);
//         geometry.faceVertexUvs[0][1][2].set(3.6, 3.6);
//         // geometry.uvsNeedUpdate = true;
//         texture.wrapS = THREE.RepeatWrapping;
//         texture.wrapT = THREE.MirroredRepeatWrapping;
//     }
//     materia.lightMapIntensity = 0.3;
//     materia.metalness = 0.2;
//     materia.roughness = 1;
//     materia.side = THREE.DoubleSide;//|FrontSide| BackSide;
//     const mesh = new THREE.Mesh(geometry, materia)
//     mesh.castShadow = true;
//     // mesh.receiveShadow = true;
//     mesh.position.set(THREE.Math.randInt(-5, 5), THREE.Math.randInt(-5, 5), THREE.Math.randInt(-5, 5));
//     this.scene.add(mesh);
//     objects.push(mesh);
// }

// const verticesOfCube = [
//     -1.2, -0.1, 1, 0.5, -1, -1, 2.5, 1, -0.3, -1, 1.1, -1,
//     -1, -1, -0.5, 1, -1.1, 1, 1, 1.8, 1, -1, 1.2, 0.5,
// ], indicesOfFaces = [
//     2, 1, 0, 0, 3, 2,
//     0, 4, 7, 7, 3, 0,
//     0, 1, 5, 5, 4, 0,
//     1, 2, 6, 6, 5, 1,
//     2, 3, 7, 7, 6, 2,
//     4, 5, 6, 6, 7, 4
// ];

// const polyhedron = new PolyhedronGeometry(verticesOfCube, indicesOfFaces, 1, 1),
//     materia0 = new MeshStandardMaterial({ map: new TextureLoader().load(require("@/assets/textures/crate.gif")) }),
//     mesh0 = new Mesh(polyhedron, materia0);
// this.scene.add(mesh0);
// objects.push(mesh0);


// const border = new EdgesHelper(mesh, 0xffff00);
// border.position.set(0, 0, -5);
// this.scene.add(border);
// objects.push(border);

// const normalHelper = new VertexNormalsHelper(mesh);
// this.scene.add(normalHelper);