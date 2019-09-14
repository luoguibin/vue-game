export default class ViewControl {

    /**
     * origin sphere equation:
     *      x = r * sin(xyThea) * cos(zFigh)
     *      y = r * sin(xyThea) * sin(zFigh)
     *      z = r * cos(xyThea)
     * xyThea ∈ [0, Math.PI]
     * zFigh  ∈ [0, Math.PI * 2]
     */
    xyThea = Math.PI / 2;
    zFigh = Math.PI / 4;
    radius = 20;

    MIN_RADIANS = 1 / 180 * Math.PI;
    MAX_RADIANS = 85 / 180 * Math.PI;
    RADIANS_FACTOR = Math.PI / 1800;

    MIN_RADIUS = 5;
    MAX_RADIUS = 400;
    WHELL_FACTOR = 1.5;

    raycaster = new THREE.Raycaster();
    objects = [];

    callMaps = {};

    static CALL_UP = "call-up"

    /**
     * init the view control
     * @param {THREE.Camera} camera 
     * @param {HTMLElement} dom 
     * @param {THREE.Vector3} point 
     */
    constructor(camera, dom, point) {
        this.camera = camera;
        this.dom = dom ? dom : document.body;
        this.point = point ? point : new THREE.Vector3();

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.initEvents();
    }

    initEvents() {
        const dom = this.dom;
        dom.addEventListener("mousedown", this.onMouseDown);
        dom.addEventListener("mouseup", this.onMouseUp);
        dom.addEventListener("mouseout", this.onMouseOut);
        dom.addEventListener("wheel", this.onWheel);
        this._update();
    }

    setCall(key, func) {
        this.callMaps[key] = func;
        return true;
    }

    setObjects(objects) {
        this.objects = objects;
    }

    setPoint(point) {
        this.point = point;
        this._update();
    }

    release() {
        const dom = this.dom;
        dom.removeEventListener("mousedown", this.onMouseDown);
        dom.removeEventListener("mouseup", this.onMouseUp);
        dom.removeEventListener("mouseout", this.onMouseOut);
        dom.removeEventListener("wheel", this.onWheel);

        this.camera.lookAt(0, 0, 0);
        this.callMaps = null;
        this.objects = null;
        this.camera = null;
        this.point = null;
    }

    update() {
        this._update();
    }

    _update() {
        // swap the z and the y from the sphere equation, 
        // because of difference of the axes definition
        const x = this.radius * Math.sin(this.zFigh) * Math.cos(this.xyThea),
            z = this.radius * Math.sin(this.zFigh) * Math.sin(this.xyThea),
            y = this.radius * Math.cos(this.zFigh),
            point = this.point,
            camera = this.camera;

        camera.position.set(point.x + x, point.y + y, point.z + z);
        camera.lookAt(point);
    }

    /**
     * onMouseDown
     * @param {MouseEvent} e 
     */
    onMouseDown(e) {
        if (e.srcElement.tagName !== "CANVAS") return;
        if (e.button === 2) {
            this.dom.addEventListener("mousemove", this.onMouseMove);
        }
        this.mPoint = this.getMousePoint(e);
    }

    onMouseMove(e) {
        this.hasMove = true;
        const mPoint = this.getMousePoint(e),
            xVal = mPoint.x - this.mPoint.x,
            yVal = mPoint.y - this.mPoint.y;

        this.mPoint = mPoint;
        this.zFigh -= yVal * this.RADIANS_FACTOR;
        this.xyThea += xVal * this.RADIANS_FACTOR;
        this.zFigh = Math.max(this.zFigh, this.MIN_RADIANS);
        this.zFigh = Math.min(this.zFigh, this.MAX_RADIANS);
        this.xyThea += Math.PI * 2;
        this.xyThea %= Math.PI * 2;

        this._update();
    }

    /**
     * onWheel
     * @param {WheelEvent} e 
     */
    onWheel(e) {
        if (e.srcElement !== e.target) return;

        this.radius += e.deltaY / Math.abs(e.deltaY) * this.WHELL_FACTOR;
        this.radius = Math.min(this.radius, this.MAX_RADIUS);
        this.radius = Math.max(this.radius, this.MIN_RADIUS);

        this._update();
    }

    onMouseUp(e) {
        if (e.srcElement.tagName !== "CANVAS") return;

        const dom = this.dom;
        if (!this.hasMove) {
            const mPoint = this.getMousePoint(e),
                point = new THREE.Vector2(
                    mPoint.x / dom.clientWidth * 2 - 1,
                    -mPoint.y / dom.clientHeight * 2 + 1
                );

            this.raycaster.setFromCamera(point, this.camera);
            const intersects = this.raycaster.intersectObjects(this.objects, true);
            if (intersects.length > 0) {
                const call = this.callMaps[ViewControl.CALL_UP];
                call && call(intersects[0], e.button);
            }
        }
        if (e.button === 2) {
            dom.removeEventListener("mousemove", this.onMouseMove);
            this.hasMove = false;
        }
    }

    onMouseOut(e) {
        this.dom.removeEventListener("mousemove", this.onMouseMove);
        this.hasMove = false;
    }

    getMousePoint(e) {
        const rect = this.dom.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
}