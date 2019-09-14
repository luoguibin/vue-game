import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        userInfo: JSON.parse(sessionStorage.getItem("sghen_user_info")) || {}
    },
    mutations: {
        setUserInfo(state, userInfo) {
            if (userInfo) {
                sessionStorage.setItem("sghen_user_info", JSON.stringify(userInfo));
                state.userInfo = userInfo;
            } else {
                sessionStorage.removeItem("sghen_user_info");
                state.userInfo = {};
            }
        }
    },
    actions: {
        setUserInfo(context, userInfo) {
            context.commit("setUserInfo", userInfo)
        }
    },
})
