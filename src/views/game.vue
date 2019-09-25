<template>
  <div class="game">
    <el-button-group class="game-items">
      <el-button
        v-for="(item, key) in items"
        :key="key"
        :disabled="item.disabled"
        @click="onClickItem(key)"
      >{{item.name}}</el-button>
    </el-button-group>
  </div>
</template>

<script>
import { wsUrl } from "@/api/config";
import OrderCenter from "../common/order-center";
import GameScene from "../common/game-scene";

export default {
  name: "game",

  props: ["token", "id"],

  data() {
    return {
      ws: null,
      items: {
        connect: { name: "开始", disabled: false },
        release: { name: "结束", disabled: true },
        order: { name: "指令", disabled: true }
      }
    };
  },

  mounted() {
    window.game = this;

    document.oncontextmenu = function() {
      return false;
    };

    this.onClickItem("connect");
  },

  methods: {
    /**
     * @description 菜单按钮事件
     */
    onClickItem(key) {
      switch (key) {
        case "connect":
          this.connectServer();
          this.items.connect.disabled = true;
          break;
        case "release":
          this.releaseGame();
          this.items.release.disabled = true;
          break;
        case "order":
          this.sendOrder();
          break;
        default:
          break;
      }
    },

    /**
     * @description 连接服务器
     */
    connectServer() {
      if (this.ws) {
        return;
      }
      if (!("WebSocket" in window)) {
        Message.warning({ message: "当前浏览器不支持WebSocket" });
        return;
      }

      const ws = new WebSocket(wsUrl + "?token=" + this.token);
      if (!ws) {
        console.log("ws create error");
        return;
      }

      ws.onopen = () => {
        console.log("connectServer() ws onopen");
        this.$message.success({ message: "连接服务器成功" });
        this.items.release.disabled = false;
        this.items.order.disabled = false;
        this.ws = ws;

        // 连接成功后初始化游戏场景
        GameScene.initScene(this);
      };

      ws.onmessage = e => {
        OrderCenter.parseOrder(JSON.parse(e.data));
      };

      ws.onerror = e => {
        console.log("ws error", e);
        this.$message.error({ message: "连接服务器失败" });
      };

      ws.onclose = e => {
        console.log("ws close", e);
        if (this.ws) {
          this.$message.error({ message: "与服务器断开连接" });
        }
        this.items.connect.disabled = false;
        this.items.release.disabled = true;
        this.items.order.disabled = true;
        this.ws = null;
      };
    },

    /**
     * 发送指令
     */
    sendOrder(order) {
      if (!this.ws) {
        return;
      }
      this.ws.send(JSON.stringify(order));
    },

    /**
     * @description 释放连接
     */
    releaseGame() {
      this.ws && this.ws.close();
    }
  }
};
</script>

<style scoped>
.game {
  height: 100%;
  overflow: hidden;
}

.game .game-items {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: fit-content;
  margin: 0 auto;
}
</style>