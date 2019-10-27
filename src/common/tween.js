export default class Tween {
    id = Tween.tweenId++;

    startVal = {};
    endVal = {};

    ratio = 0;
    val = {};

    repeatCount = 1;
    currentRepeat = 0;

    delayTime = 0;
    duration = 1000;
    currentTime = 0;

    constructor(startVal) {
        this.startVal = startVal || {};
    }

    static newTween(startVal) {
        window.Tween = Tween;
        return new Tween(startVal);
    }

    static tweens = [];
    static tweenId = 1000;
    static isTest = false;

    static update(timeStep) {
        if (Tween.isTest) {
            return;
        }
        Tween.tweens.forEach(o => {
            o._update(timeStep);
        })
    }

    static updateAll(isTest) {
        Tween.isTest = isTest;
        Tween.tweens.forEach(o => {
            o._update(16);
        })
    }

    static release() {
        const tweens = Tween.tweens,
            len = tweens.length;
        for (let i = len - 1; i >= 0; i--) {
            tweens.pop();
        }
    }

    to(endVal, duration) {
        this.endVal = endVal || {};
        this.duration = duration || 1000;
        return this;
    }

    repeat(repeatCount) {
        this.repeatCount = repeatCount;
        return this;
    }

    delay(time) {
        this.delayTime = time;
        return this;
    }

    onUpdate(call) {
        this.updateCall = call;
        return this;
    }

    start(delay) {
        this.currentTime = 0;
        this.currentRepeat = 0;
        const startVal = this.startVal,
            endVal = this.endVal,
            val = this.val;
        for (const key in endVal) {
            if (endVal.hasOwnProperty(key)) {
                val[key] = endVal[key] - startVal[key];
            }
        }

        if (delay) {
            setTimeout(() => {
                Tween.tweens.push(this);
            }, delay);
        } else {
            Tween.tweens.push(this);
        }

        return this;
    }

    remove() {
        const index = Tween.tweens.findIndex(o => o.id === this.id);
        if (index !== -1 && this.id > 0) {
            this.id = -this.id;
            Tween.tweens.splice(index, 1)
            this.updateCall = null;
        }
    }

    _update(timeStep) {
        this.currentTime += timeStep || 33;
        if (this.delayTime > 0) {
            // console.log("delayTime:", this.delayTime, this.currentTime, this.ratio)
            if (this.currentTime < this.delayTime) {
                return;
            }
            this.currentTime = this.currentTime - this.delayTime;
            this.delayTime = -this.delayTime;
        }
        // console.log("currentTime:", this.currentTime, this.ratio)

        // console.log(this.currentTime, this.currentRepeat)
        let ratio;
        if (this.currentTime >= this.duration) {
            if (this.repeatCount === Infinity) {
                this.currentTime %= this.duration;

                if (this.delayTime !== 0) {
                    ratio = 1;
                } else {
                    ratio = this.currentTime / this.duration;
                }
            } else {
                this.currentRepeat++;
                if (this.currentRepeat > this.repeatCount) {
                    this.currentTime = this.duration;
                    this.remove();
                }
                ratio = 1;
            }
            this.delayTime = -this.delayTime;
        } else {
            ratio = this.currentTime / this.duration
        }

        const startVal = this.startVal,
            endVal = this.endVal,
            val = this.val;
        for (const key in val) {
            startVal[key] = endVal[key] - (1 - ratio) * val[key];
        }
        this.ratio = ratio;
        this.updateCall && this.updateCall(ratio);
    }
}