<template>
  <div id="app">
    <game v-if="token" :token="token"></game>
  </div>
</template>

<script>
export default {
  name: "app",

  components: {
    game: () => import("@/views/game")
  },

  data() {
    return {
      token: "" // sessionStorage.getItem("sghen_game_token") || ""
    };
  },

  mounted() {
    window.app = this;
    if (!this.token) {
      const search = location.search;
      const token = search.replace("?token=", "");
      if (!token) {
        location.href =
          "http://www.sghen.cn/index.html?login_direct=" +
          window.decodeURIComponent(location.href);
        return;
      }
      this.token = token;
      // sessionStorage.setItem("sghen_game_token", token);
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
