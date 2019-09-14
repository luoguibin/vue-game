<template>
  <div id="app">
    <login v-if="!userInfo.token"></login>
    <game v-else :token="userInfo.token"></game>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "app",

  components: {
    game: () => import("@/views/game"),
    login: () => import("@/views/login")
  },

  data() {
    return {};
  },

  mounted() {
    this.init();
    window.app = this;
  },

  computed: {
    ...mapState({
      userInfo: state => state.userInfo
    })
  },

  methods: {
    init() {}
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
