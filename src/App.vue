<template>
  <div id="app">
    <game v-if="userInfo.token"></game>
    <login-dialog></login-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import LoginDialog from "@/views/login-dialog";

export default {
  name: "app",

  components: {
    game: () => import("@/views/game"),
    LoginDialog
  },

  data() {
    return {};
  },

  mounted() {
    window.app = this;
    this.init();
    if (!this.userInfo.token) {
      this.showLogin();
    }
  },

  computed: {
    ...mapState({
      userInfo: state => state.user
    })
  },

  methods: {
    init() {},

    ...mapActions(["showLogin"])
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
