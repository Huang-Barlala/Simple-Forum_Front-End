<template>
  <div>
    <v-card class="pa-3">
      <div class="d-flex flex-row">
        <div class="text-center">
          <v-img
            :src="userDetail.avatarurl"
            height="300px"
            width="300px"
          ></v-img>
          <v-btn @click="dialog = true">换头像</v-btn>
        </div>
        <div
          class="d-flex flex-column justify-space-around align-center"
          style="width: 100%"
        >
          <div class="d-flex justify-center">
            <div class="d-flex align-center" v-if="!editUsername">
              <span v-text="userDetail.username" style="font-size: 40px"></span>
              <v-btn icon @click="editUsername = true">
                <v-icon>fas fa-edit</v-icon>
              </v-btn>
            </div>
            <div v-else class="d-flex align-center">
              <v-btn icon @click="editUsername = false">
                <v-icon>fas fa-arrow-left</v-icon>
              </v-btn>
              <v-text-field
                clearable
                single-line
                label="用户名"
                v-model="newUsername"
                :error-messages="usernameErrorMessage"
                :success-messages="usernameSuccessMessage"
                @input="usernameCheck"
              ></v-text-field>
              <v-btn icon>
                <v-icon @click="changeUsername">far fa-paper-plane</v-icon>
              </v-btn>
            </div>
          </div>
          <div>
            <div class="d-flex justify-center">
              <div class="d-flex align-center" v-if="!editEmail">
                邮箱：<span
                  v-text="
                    userDetail.email == null ? '未绑定邮箱' : userDetail.email
                  "
                ></span>
                <v-btn icon @click="editEmail = true">
                  <v-icon>fas fa-edit</v-icon>
                </v-btn>
              </div>
              <div v-else class="d-flex align-center">
                <v-btn icon @click="editEmail = false">
                  <v-icon>fas fa-arrow-left</v-icon>
                </v-btn>
                <v-text-field
                  clearable
                  single-line
                  label="邮箱"
                  v-model="newEmail"
                  :error-messages="emailErrorMessage"
                  :success-messages="emailSuccessMessage"
                  @input="emailCheck"
                ></v-text-field>
                <v-btn icon>
                  <v-icon @click="changeEmail">far fa-paper-plane</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
          <div>
            注册日期：&nbsp;<span v-text="userDetail.createtime"></span>
          </div>
          <div>
            <v-btn v-if="!isChangePassword" @click="isChangePassword = true"
              >修改密码
            </v-btn>
            <div class="d-flex align-center" v-else>
              <v-text-field
                :append-icon="show1 ? 'far fa-eye' : 'far fa-eye-slash'"
                :type="show1 ? 'text' : 'password'"
                @click:append="show1 = !show1"
                class="mx-6"
                clearable
                single-line
                label="修改密码"
                :rules="isPassChecked ? realRule : []"
                v-model="password"
                outlined
                :placeholder="isPassChecked ? '请输入新密码' : '请输入原密码'"
              ></v-text-field>
              <v-btn icon>
                <v-icon @click="changePassword" style="margin-top: -25px"
                  >far fa-paper-plane
                </v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-card>
    <v-expansion-panels v-model="panel">
      <v-expansion-panel @change="fetchTopicInfo">
        <v-expansion-panel-header
          >帖子数：{{ userDetail.topicnum }}
          <v-progress-circular
            indeterminate
            v-if="isLoading"
          ></v-progress-circular>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list>
            <v-list-item
              v-for="(item, i) in topicInfo"
              :key="i"
              ripple
              @click="routeToTopic(item.id)"
            >
              <v-list-item-title v-text="item.title"></v-list-item-title>
              <v-list-item-action>
                <v-btn icon @click.stop="chooseDeleteTopic(item.id)">
                  <v-icon>far fa-times-circle</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog v-model="dialog2" @click:outside="dialog2 = false" width="200px">
      <v-card class="text-center py-5">
        <div class="my-1">是否删除该主题</div>
        <v-btn @click="deleteTopic" class="mx-1 " color="error">是</v-btn>
        <v-btn @click="dialog2 = false" class="mx-1">否</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog" @click:outside="dialog = false" width="700px">
      <v-card class="d-flex flex-row">
        <div style="height: 500px;width: 500px">
          <vue-cropper
            style="background-repeat: repeat"
            ref="cropper"
            :img="option.img"
            :autoCropWidth="option.autoCropWidth"
            :autoCropHeight="option.autoCropHeight"
            :fixedBox="option.fixedBox"
            :canMoveBox="option.canMoveBox"
            :autoCrop="option.autoCrop"
            @imgMoving="realTime"
            @scroll="realTime"
            @mousewheel.native="realTime"
          ></vue-cropper>
        </div>
        <div
          class="d-flex flex-column justify-start align-center text-center"
          style="width: 200px"
        >
          <div class="my-6">
            <v-img
              :src="cropImg"
              width="100px"
              height="100px"
              style="border-style: solid;border-width: 2px"
            ></v-img>
            <div>方形预览</div>
            <v-img
              :src="cropImg"
              width="100px"
              height="100px"
              style="border-radius: 50%;border-style: solid;border-width: 2px"
              class="mt-3"
            ></v-img>
            <div>圆形预览</div>
          </div>
          <v-btn @click="chooseFile" class="my-4">选择图片</v-btn>
          <v-btn @click="uploadFile" class="my-4">修改</v-btn>
          <input
            id="file"
            type="file"
            accept="image/jpeg, image/jpg, image/png"
            hidden
            @change="changeFile($event)"
          />
        </div>
      </v-card>
    </v-dialog>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { VueCropper } from "vue-cropper";

export default {
  name: "User",
  components: {
    VueCropper
  },
  data: () => {
    return {
      option: {
        img: "",
        autoCropWidth: 300,
        autoCropHeight: 300,
        fixedBox: true,
        canMoveBox: false,
        autoCrop: true,
        centerBox: true
      },
      userDetail: {},
      dialog: false,
      dialog2: false,
      cropImg: "",
      newImgUrl: "",
      topicInfo: [],
      isLoading: false,
      editUsername: false,
      usernameSuccessMessage: "",
      usernameErrorMessage: "",
      newUsername: "",
      editEmail: false,
      emailSuccessMessage: "",
      emailErrorMessage: "",
      newEmail: "",
      panel: null,
      realRule: [
        value => value.length <= 32 || "最长为32字符",
        value => value.length >= 8 || "最短为8字符",
        value => {
          const pattern = /^[A-Za-z~!@#$%^&*]+$/;
          return !pattern.test(value) || "必须包含数字";
        },
        value => {
          const pattern = /^[0-9~!@#$%^&*]+$/;
          return !pattern.test(value) || "必须包含字母";
        }
      ],
      password: "",
      show1: false,
      isPassChecked: false,
      overlay: false,
      isChangePassword: false,
      selectedTopicId: null
    };
  },
  methods: {
    realTime() {
      this.$refs.cropper.getCropData(data => {
        this.cropImg = data;
      });
    },
    changeFile(event) {
      if (event.target.files.length > 0) {
        let file = event.target.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = e => {
          this.option.img = e.target.result;
          this.cropImg = e.target.result;
        };
      }
    },
    chooseFile() {
      document.getElementById("file").click();
    },
    uploadFile() {
      this.$refs.cropper.getCropBlob(data => {
        if (data.size >= 1024 * 1024 * 10) {
          return;
        }
        let formData = new FormData();
        formData.append("file", data);
        this.$axios({
          method: "POST",
          url: "/api/uploadImage",
          data: formData
        }).then(res => {
          if (res.data.code === 200) {
            this.newImgUrl = res.data.data;
            this.$axios
              .post(
                "/api/updateAvatar",
                this.$qs.stringify({ avatarUrl: this.newImgUrl })
              )
              .then(res2 => {
                if (res2.data.code === 200) {
                  this.$store.commit("showSnackbar", {
                    color: "success",
                    text: "头像修改成功"
                  });
                  this.$store.commit("updateUserInfo");
                  this.userDetail.avatarurl = this.newImgUrl;
                  this.dialog = false;
                }
              });
          }
        });
      });
    },
    fetchTopicInfo() {
      if (this.panel != null) {
        return;
      }
      this.isLoading = true;
      this.$axios.get("/api/getUserTopicInfo").then(res => {
        this.isLoading = false;
        if (res.data.code === 200) {
          this.topicInfo = [];
          for (let item of res.data.data) {
            this.topicInfo.push(item);
          }
        }
      });
    },
    routeToTopic(id) {
      this.$router.push("/topic/" + id);
    },
    usernameCheck() {
      if (this.newUsername === "") {
        this.usernameErrorMessage = "用户名不能为空";
        this.usernameSuccessMessage = "";
        return;
      }
      this.$axios
        .post(
          "/api/usernameCheck",
          this.$qs.stringify({ username: this.newUsername })
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
      if (this.newEmail === "") {
        this.emailErrorMessage = "邮箱不能为空";
        this.emailSuccessMessage = "";
        return;
      }
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!pattern.test(this.newEmail)) {
        this.emailErrorMessage = "邮箱格式不正确";
        this.emailSuccessMessage = "";
        return;
      }
      this.$axios
        .post("/api/emailCheck", this.$qs.stringify({ email: this.newEmail }))
        .then(res => {
          if (res.data.data === false) {
            this.emailErrorMessage = "邮箱重复";
            this.emailSuccessMessage = "";
          } else {
            this.emailErrorMessage = "";
            this.emailSuccessMessage = "邮箱可用";
          }
        });
    },
    changeUsername() {
      if (this.newUsername !== "" && this.usernameErrorMessage === "") {
        this.overlay = true;
        this.$axios
          .post(
            "/api/updateUsername",
            this.$qs.stringify({ username: this.newUsername })
          )
          .then(res => {
            this.overlay = false;
            if (res.data.code === 200) {
              this.$store.commit("showSnackbar", {
                color: "success",
                text: "用户名修改成功"
              });
              this.$store.commit("updateUserInfo");
              this.userDetail.username = this.newUsername;
              this.newUsername = "";
              this.editUsername = false;
            }
          });
      }
    },
    changeEmail() {
      if (this.newEmail !== "" && this.emailErrorMessage === "") {
        this.overlay = true;
        this.$axios
          .post(
            "/api/updateEmail",
            this.$qs.stringify({ email: this.newEmail })
          )
          .then(res => {
            this.overlay = false;
            if (res.data.code === 200) {
              this.$store.commit("showSnackbar", {
                color: "success",
                text: "邮箱修改成功"
              });
              this.userDetail.email = this.newEmail;
              this.newEmail = "";
              this.editEmail = false;
            }
          });
      }
    },
    changePassword() {
      this.overlay = true;
      if (this.isPassChecked) {
        this.$axios
          .post(
            "/api/updatePassword",
            this.$qs.stringify({ password: this.password })
          )
          .then(res => {
            this.overlay = false;
            if (res.data.code === 200) {
              this.isPassChecked = false;
              this.password = "";
              this.$store.commit("showSnackbar", {
                color: "success",
                text: "密码修改成功"
              });
              this.isChangePassword = true;
            }
          });
      } else {
        this.$axios
          .post(
            "/api/checkPassword",
            this.$qs.stringify({ password: this.password })
          )
          .then(res => {
            this.overlay = false;
            this.password = "";
            if (res.data.code === 200) {
              this.isPassChecked = true;
              this.$store.commit("showSnackbar", {
                color: "success",
                text: "密码验证成功"
              });
            } else {
              this.$store.commit("showSnackbar", {
                color: "error",
                text: "密码验证失败"
              });
            }
          });
      }
    },
    deleteTopic() {
      this.dialog2 = false;
      this.$axios
        .post(
          "/api/deleteTopic",
          this.$qs.stringify({ topicId: this.selectedTopicId })
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "删除成功"
            });
            this.userDetail.topicnum = this.userDetail.topicnum - 1;
            for (let i in this.topicInfo) {
              if (this.topicInfo[i].id === this.selectedTopicId) {
                this.topicInfo.splice(i, 1);
              }
            }
          }
        });
    },
    chooseDeleteTopic(topicId) {
      this.dialog2 = true;
      this.selectedTopicId = topicId;
    }
  },
  created() {
    if (!this.$store.state.isLogin) {
      this.$router.back();
    } else {
      this.$axios.get("/api/getUserDetail").then(res => {
        if (res.data.code === 200) {
          this.userDetail = res.data.data;
          this.userDetail.createtime = this.userDetail.createtime.substring(
            0,
            10
          );
          this.option.img = this.userDetail.avatarurl;
        }
      });
    }
  }
};
</script>

<style scoped></style>
