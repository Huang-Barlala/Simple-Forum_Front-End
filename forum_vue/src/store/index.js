import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLogin: false,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "success",
    userInfo: {}
  },
  mutations: {
    changeLoginTrue(state) {
      state.isLogin = true;
    },
    changeLoginFalse(state) {
      state.isLogin = false;
    },
    changeSnackbar(state, payload) {
      state.snackbar = payload;
    },
    changeSnackbarText(state, payload) {
      state.snackbarText = payload;
    },
    changeSnackbarColor(state, payload) {
      state.snackbarColor = payload;
    },
    showSnackbar(state, payload) {
      state.snackbarColor = payload.color;
      state.snackbarText = payload.text;
      state.snackbar = true;
    },
    changeUserInfo(state, payload) {
      state.userInfo = payload;
    },
    updateUserInfo(state) {
      let cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        if (cookie.trim().indexOf("jwt=") === 0) {
          state.isLogin = true;
          let jwt = cookie.substring(4);
          state.userInfo = JSON.parse(atob(jwt.split(".")[1]));
        }
      }
    }
  },
  actions: {},
  modules: {}
});
