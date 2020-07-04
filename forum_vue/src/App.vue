<template>
  <v-app id="simple-forum">
    <v-app-bar app color="#ffffff" dark>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attr }">
          <v-toolbar-title
            class="black--text"
            @click="routeToHome"
            v-on="on"
            v-bind="attr"
            >Simple-Forum</v-toolbar-title
          >
        </template>
        <span>首页</span>
      </v-tooltip>

      <v-spacer></v-spacer>
      <div v-if="$store.state.isLogin === true" class="d-flex align-center">
        <v-tooltip bottom internal-activator>
          <template v-slot:activator="{ on, attr }">
            <v-avatar v-on="on" v-bind="attr" @click="routeToUser">
              <v-img :src="$store.state.userInfo.avatar"></v-img>
            </v-avatar>
          </template>
          <span>我的信息</span>
        </v-tooltip>
        <v-tooltip bottom internal-activator>
          <template v-slot:activator="{ on, attr }">
            <span
              v-on="on"
              v-bind="attr"
              class="mx-3"
              style="color: black;font-size: 20px"
              v-text="$store.state.userInfo.username"
            ></span>
          </template>
          <span v-text="userGroup[$store.state.userInfo.permission]"></span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attr }">
            <v-btn icon elevation="5" @click="logout" v-on="on" v-bind="attr"
              ><v-icon color="black" style="height: 48px;width: 48px"
                >fas fa-sign-out-alt</v-icon
              ></v-btn
            >
          </template>
          <span>退出</span>
        </v-tooltip>
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
                :error-messages="usernameErrorMessage"
                :success-messages="usernameSuccessMessage"
                @input="usernameCheck"
              ></v-text-field>
              <v-text-field
                outlined
                v-model="reg_email"
                label="邮箱(可空)"
                hint="请输入邮箱"
                :error-messages="emailErrorMessage"
                :success-messages="emailSuccessMessage"
                @input="emailCheck"
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
          multi-line
          :color="$store.state.snackbarColor"
          timeout="3000"
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
    tab: null,
    usernameSuccessMessage: "",
    usernameErrorMessage: "",
    emailSuccessMessage: "",
    emailErrorMessage: "",
    userGroup: { admin: "管理员", user: "用户" }
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
            this.$store.commit("updateUserInfo");
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
    logout() {
      this.$axios.get("/api/logout").then(res => {
        if (res.data.code === 200) {
          this.$store.commit("changeLoginFalse");
          this.$store.commit("showSnackbar", {
            color: "success",
            text: "退出成功"
          });
        }
      });
    },
    usernameCheck() {
      this.$axios
        .post(
          "/api/usernameCheck",
          this.$qs.stringify({ username: this.reg_username })
        )
        .then(res => {
          if (res.data.data === false) {
            this.usernameErrorMessage = "用户名重复";
            this.usernameSuccessMessage = "";
          } else {
            this.usernameErrorMessage = "";
            this.usernameSuccessMessage = "用户名可用";
          }
        });
    },
    emailCheck() {
      if (this.reg_email === "") {
        this.emailErrorMessage = "";
        this.emailSuccessMessage = "";
        return;
      }
      if (this.rules.email(this.reg_email) === true) {
        this.$axios
          .post(
            "/api/emailCheck",
            this.$qs.stringify({ email: this.reg_email })
          )
          .then(res => {
            if (res.data.data === false) {
              this.emailErrorMessage = "邮箱重复";
              this.emailSuccessMessage = "";
            } else {
              this.emailErrorMessage = "";
              this.emailSuccessMessage = "邮箱可用";
            }
          });
      } else {
        this.emailErrorMessage = "邮箱格式错误";
        this.emailSuccessMessage = "";
      }
    },
    routeToHome() {
      this.$router.push("/").catch(error => {
        error;
      });
    },
    routeToUser() {
      this.$router.push("/user").catch(error => {
        error;
      });
    }
  },
  created() {
    this.$store.commit("updateUserInfo");
  }
};
</script>
<style>
img {
  max-width: 100%;
  max-height: 100%;
}
.ql-container {
  overflow-y: auto;
}
</style>
