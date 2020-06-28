<template>
  <v-app id="simple-forum">
    <v-app-bar app color="#ffffff" dark>
      <v-toolbar-title class="black--text">Simple-Forum</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="$store.state.isLogin === true" class="d-flex">
        <v-btn @click="logout" class="mr-2">退出</v-btn>
        <div style="color: black">{{ userInfo.username }}</div>
      </div>
      <div v-else>
        <v-btn @click="dialog = true">登录/注册</v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <v-dialog
        v-model="dialog"
        @click:outside="dialog = false"
        max-width="600px"
      >
        <v-tabs fixed-tabs v-model="tab">
          <v-tab>登录</v-tab>
          <v-tab>注册</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item style="height: 400px">
            <v-form
              ref="loginForm"
              class="mx-4 py-4 d-flex flex-column justify-center"
              style="height: 400px"
            >
              <v-switch
                class="mt-0"
                label="使用邮箱登录"
                v-model="useEmail"
              ></v-switch>
              <v-text-field
                v-if="useEmail === false"
                outlined
                v-model="username"
                label="用户名"
                hint="请输入用户名"
                :rules="[() => !!username || '必须输入用户名']"
              ></v-text-field>
              <v-text-field
                v-else
                outlined
                v-model="email"
                label="邮箱"
                hint="请输入邮箱"
                :rules="[rules.email]"
              >
              </v-text-field>
              <v-text-field
                outlined
                v-model="password"
                type="password"
                label="密码"
                :rules="[
                  rules.passwordMin,
                  rules.passwordMax,
                  rules.passwordHasNum,
                  rules.passwordHasAlphabet
                ]"
              ></v-text-field>
              <div class="text-center">
                <v-btn @click="login">登录</v-btn>
              </div>
            </v-form>
          </v-tab-item>
          <v-tab-item style="height: 400px">
            <v-form
              ref="regForm"
              class="mx-4 py-4 d-flex flex-column justify-center"
              style="height: 400px"
            >
              <v-text-field
                outlined
                v-model="reg_username"
                label="用户名"
                hint="请输入用户名"
                :rules="[() => !!reg_username || '必须输入用户名']"
              ></v-text-field>
              <v-text-field
                outlined
                v-model="reg_email"
                label="邮箱(可空)"
                hint="请输入邮箱"
                :rules="[rules.regEmail()]"
              >
              </v-text-field>
              <v-text-field
                outlined
                v-model="reg_password"
                type="password"
                label="密码"
                :rules="[
                  rules.passwordMin,
                  rules.passwordMax,
                  rules.passwordHasNum,
                  rules.passwordHasAlphabet
                ]"
              ></v-text-field>
              <div class="text-center">
                <v-btn @click="reg">注册</v-btn>
              </div>
            </v-form>
          </v-tab-item>
        </v-tabs-items>
      </v-dialog>
      <v-container>
        <v-snackbar
          v-model="$store.state.snackbar"
          top="top"
          :color="$store.state.snackbarColor"
        >
          {{ $store.state.snackbarText }}
          <template v-slot:action="{ attrs }">
            <v-btn
              color="white"
              text
              v-bind="attrs"
              @click="$store.commit('changeSnackbar', false)"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
        <transition>
          <router-view></router-view>
        </transition>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({
    rules: {
      passwordMax: value => value.length <= 32 || "最长为32字符",
      passwordMin: value => value.length >= 8 || "最短为8字符",
      passwordHasNum: value => {
        const pattern = /^[A-Za-z~!@#$%^&*]+$/;
        return !pattern.test(value) || "必须包含数字";
      },
      passwordHasAlphabet: value => {
        const pattern = /^[0-9~!@#$%^&*]+$/;
        return !pattern.test(value) || "必须包含字母";
      },
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "邮箱格式不正确";
      },
      regEmail: value => {
        if (value !== "") {
          return true;
        }
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "邮箱格式不正确";
      }
    },
    dialog: false,
    useEmail: false,
    username: "",
    email: "",
    password: "",
    reg_username: "",
    reg_email: "",
    reg_password: "",
    userInfo: Object,
    tab: null
  }),
  methods: {
    errorMessage(res) {
      this.$store.commit("showSnackbar", {
        color: "error",
        text: res.data.msg
      });
    },
    login() {
      if (this.$refs.loginForm.validate()) {
        let url = this.useEmail ? "/api/login/email" : "/api/login/username";
        let userData;
        if (this.useEmail) {
          userData = { email: this.email, password: this.password };
        } else {
          userData = { username: this.username, password: this.password };
        }
        this.$axios.post(url, this.$qs.stringify(userData)).then(res => {
          if (res.data.code === 200) {
            this.dialog = false;
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "登录成功"
            });
            this.getJwtCookie();
            this.username = "";
            this.email = "";
            this.password = "";
          } else {
            this.errorMessage(res);
          }
        });
      }
    },
    reg() {
      if (this.$refs.regForm.validate()) {
        let userInfo = {
          username: this.reg_username,
          password: this.reg_password
        };
        if (this.reg_email !== "") {
          userInfo["email"] = this.reg_email;
        }
        this.$axios
          .post("/api/register", this.$qs.stringify(userInfo))
          .then(res => {
            if (res.data.code === 200) {
              this.reg_username = "";
              this.reg_password = "";
              this.reg_email = "";
              this.tab = 0;
              this.$store.commit("showSnackbar", {
                color: "success",
                text: "注册成功"
              });
            } else {
              this.errorMessage(res);
            }
          });
      }
    },
    getJwtCookie() {
      let cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        if (cookie.trim().indexOf("jwt=") === 0) {
          this.$store.commit("changeLoginTrue");
          let jwt = cookie.substring(4);
          this.userInfo = JSON.parse(atob(jwt.split(".")[1]));
        }
      }
    },
    logout() {
      this.$axios.get("/api/logout").then(res => {
        if (res.data.code === 200) {
          this.$store.commit("changeLoginFalse");
          this.$store.commit("showSnackbar", {
            color: "success",
            text: "退出成功"
          });
          this.userInfo = Object;
        }
      });
    }
  },
  created() {
    this.getJwtCookie();
  }
};
</script>
