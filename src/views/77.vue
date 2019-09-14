<template>
  <div id="app">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: "app",

  data() {
    return {
      ctx: null,
      isRun: true,
      moveItems: [
        { text: "〇", fillStyle: "#148acf", x: 0, y: 0, vx: 14 / 2, vy: 14 / 2 },
        { text: "喂", fillStyle: "#16c6d8", x: 0, y: 0, vx: 10 / 2, vy: 14 / 2 },
        { text: "喂", fillStyle: "#16c6d8", x: 0, y: 0, vx: 11 / 2, vy: 13 / 2 },
        { text: "喂", fillStyle: "#16c6d8", x: 0, y: 0, vx: 12 / 2, vy: 12 / 2 },
        { text: "喂", fillStyle: "#16c6d8", x: 0, y: 0, vx: 13 / 2, vy: 11 / 2 },
        { text: "喂", fillStyle: "#16c6d8", x: 0, y: 0, vx: 14 / 2, vy: 10 / 2 }
      ]
    };
  },

  mounted() {
    this.init();
    this.start();
    window.app = this;
  },

  methods: {
    init() {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.resize();

      this.resize = this.resize.bind(this);
      window.addEventListener("resize", this.resize);
      this.$once("hook:beforeDestroy", () => {
        window.removeEventListener("resize", this.resize);
        this.isRun = false;
      });

      this.moveItems.forEach(item => {
        item.vx = Math.random() * item.vx;
        item.vy = Math.random() * item.vy;
      });
    },

    resize() {
      const c = this.$refs.canvas,
        el = this.$el;
      c.setAttribute("width", el.clientWidth + "px");
      c.setAttribute("height", el.clientHeight + "px");

      this.ctx.width = el.clientWidth;
      this.ctx.height = el.clientHeight;
    },

    start() {
      this.isRun = true;
      this.draw77();
    },

    /**
     * @param {CanvasRenderingContext2D} _ctx
     */
    draw77(_ctx) {
      const ctx = this.ctx || _ctx;
      ctx.clearRect(0, 0, ctx.width, ctx.height);
      ctx.font = "48px serif";

      this.moveItems.forEach(item => {
        ctx.fillStyle = item.fillStyle;
        ctx.fillText(item.text, item.x, item.y);

        item.x += item.vx;
        item.y += item.vy;
        if (item.x > ctx.width) {
          item.vx = -Math.abs(item.vx);
        } else if (item.x < 0) {
          item.vx = Math.abs(item.vx);
        }
        if (item.y > ctx.height) {
          item.vy = -Math.abs(item.vy);
        } else if (item.y < 0) {
          item.vy = Math.abs(item.vy);
        }
      });

      requestAnimationFrame(() => {
        if (this.isRun) {
          this.draw77();
        }
      });
    }
  }
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

html,
body,
#app {
  height: 100%;
}

#app {
  box-sizing: border-box;
  overflow: hidden;
}
</style>
