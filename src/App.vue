<template>
  <div id="app">
    <game v-if="token" :token="token" :id="id"></game>
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
      id: null,
      token: "" // sessionStorage.getItem("sghen_game_token") || ""
    };
  },

  mounted() {
    window.app = this;
    const search = location.search.substr(1);
    const keyVals = {};
    search.split("&").forEach(o => {
      const keyVal = o.split("=");
      const obj = {};
      keyVals[keyVal[0]] = keyVal[1];
    });
    if (!keyVals.token || !keyVals.id) {
      location.href =
        "http://www.sghen.cn/#/blank?login_direct=" +
        window.decodeURIComponent(location.href);
      return;
    }
    this.token = keyVals.token;
    this.id - keyVals.id;
    // sessionStorage.setItem("sghen_game_token", token);
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
