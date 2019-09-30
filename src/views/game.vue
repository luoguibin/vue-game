<template>
  <div class="game">
    <div v-show="items.friends.visible" class="friends-box">
      <span class="close" @click="onClickItem('friends')">
        <i class="el-icon-close"></i>
      </span>
      <el-scrollbar>
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="friend"
          @click="onChatFriend(friend)"
        >{{friend.name}}&nbsp;&nbsp;({{friend.level}}级)</div>
      </el-scrollbar>
    </div>

    <div v-if="chatObj" class="chat-box">
      <div style="text-align: center;">
        {{chatObj.name}}：聊天中...
        <span class="close" @click="onChatFriend()">
          <i class="el-icon-close"></i>
        </span>
      </div>
      <div style="height: 315px; padding: 10px;">
        <el-scrollbar>
          <div v-if="chatOrderMap[chatObj.id]">
            <div v-for="(order, index) in chatOrderMap[chatObj.id].orders" :key="index">
              <p v-if="order.fromId === id" class="chat-msg_self">{{order.data}}</p>
              <p v-else class="chat-msg_other">{{order.data}}</p>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <el-input v-model="chatContent">
        <span slot="append" @click="onSendChatContent">发送</span>
      </el-input>
    </div>

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
import GameOrder from "../common/game-order";
import GameConst from "../common/game-const";

export default {
  name: "game",

  props: ["token", "id"],

  data() {
    return {
      ws: null,
      items: {
        friends: { name: "好友", visible: false }
      },
      findFriendId: null,
      friends: [],

      chatObj: null,
      chatContent: "",
      chatOrderMap: {}
    };
  },

  mounted() {
    window.game = this;

    document.oncontextmenu = function() {
      return false;
    };

    this.connectServer();
  },

  methods: {
    /**
     * @description 菜单按钮事件
     */
    onClickItem(key) {
      const item = this.items[key];
      switch (key) {
        case "friends":
          item.visible = !item.visible;
          break;
        default:
          break;
      }
    },

    /**
     * @description 设置在线角色列表
     * @param {Object} friends
     */
    addFriends(friends = []) {
      friends.forEach(o => {
        if (o.id === this.id) {
          return;
        }
        const index = this.friends.findIndex(o_ => o_.id === o.id);
        if (index === -1) {
          this.friends.push(o);
        }
      })
    },

    /**
     * @description 打开聊天界面
     * @param {Object} friend
     */
    onChatFriend(friend) {
      this.chatObj = friend;
    },

    /**
     * @description 发送聊天信息
     */
    onSendChatContent() {
      if (!this.chatContent) {
        this.$message.warning("请输入内容!");
        return;
      }
      const order = new GameOrder(this.id, GameConst.CG_Person);
      order.setValue(
        GameConst.CG_Person,
        this.chatObj.id,
        GameConst.CT_MSG,
        GameConst.CT_MSG_PERSON,
        this.chatContent
      );
      this.sendOrder(order);
      this.chatContent = "";
    },

    /**
     * @description 接受个人聊天信息
     * @param {Object} order
     */
    addPersonMsg(order) {
      const id = order.fromId === this.id ? order.toId : order.fromId;
      let obj = this.chatOrderMap[id];
      if (!obj) {
        obj = { orders: [] };
        this.chatOrderMap[id] = obj;
      }

      obj.orders.push(order);
      this.$forceUpdate();
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

<style lang="scss" scoped>
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

.friends-box {
  position: fixed;
  bottom: 50px;
  right: 10px;
  max-width: 260px;
  width: 30%;
  max-height: 500px;
  height: 70%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;

  .close {
    float: right;
    margin: 10px;
    cursor: pointer;
  }

  .friend {
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: rgba(20, 129, 207, 0.5);
    }
  }
}

.chat-box {
  position: fixed;
  bottom: 0;
  right: 0;
  top: 0;
  left: 0;
  background-color: rgba(207, 207, 207, 0.9);
  border-radius: 10px;
  margin: auto;
  max-width: 500px;
  width: 95%;
  max-height: 400px;
  height: 70%;
  z-index: 200;

  .close {
    float: right;
    margin: 10px;
    cursor: pointer;
  }

  .chat-msg_self {
    width: 80%;
    margin-left: 20%;
    margin-bottom: 10px;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    background-color: #595f92;
  }

  .chat-msg_other {
    width: 80%;
    margin-right: 20%;
    margin-bottom: 10px;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    background-color: #5e9290;
  }
}
</style>

<style lang="scss">
.game {
  .el-scrollbar {
    width: 100%;
    height: 100%;

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }

  .chat-box {
    .el-input-group__append {
      cursor: pointer;
    }
  }
}
</style>