<template>
  <div></div>
</template>

<script>
import GameWs from "@/common/game-ws";

export default {
  name: "game",

  props: {
    token: {
      type: String,
      required: true,
      default: ""
    }
  },

  created() {
    window.game = this;
    GameWs.connect(this.token);
  },

  methods: {
    sendData(data) {
      GameWs.sendOrder({
          fromGroup: 2000,
          fromId: 15625045984,
          toGroup: 2000,
          toId: 15622222222,
          type: 1000,
          id: 1001,
          data: "魏大姐"
      });
    }
  }
};
</script>

<style>
</style>