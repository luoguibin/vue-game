import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: (function() {
      const temp = sessionStorage.getItem('sghen_user_info') || ""
      return JSON.parse(window.decodeURIComponent(window.atob(temp)) || "{}")
    }()),
    loginCount: 0
  },
  mutations: {
    setUser (state, user) {
      if (user) {
        const temp = JSON.stringify(user) || ""
        sessionStorage.setItem('sghen_user_info', window.btoa(window.encodeURIComponent(temp)))
        state.user = user
      } else {
        sessionStorage.removeItem('sghen_user_info')
        state.user = {}
      }
    },
    showLogin (state) {
      state.loginCount++
    }
  },
  actions: {
    setUser (context, user) {
      context.commit('setUser', user)
    },
    showLogin (context) {
      context.commit('showLogin')
    }
  }
})
