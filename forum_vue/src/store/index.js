import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLogin: false,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "success"
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
    }
  },
  actions: {},
  modules: {}
});
