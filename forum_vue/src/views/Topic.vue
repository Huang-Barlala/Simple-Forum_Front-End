<template>
  <div>
    <div>
      <v-card>
        <div class="d-flex flex-column my-4" style="min-height: 250px">
          <div class="d-flex flex-row align-center justify-space-between">
            <div class="ma-1">
              <v-avatar>
                <v-img :src="topicInfo.authoravatar"></v-img>
              </v-avatar>
              <div v-text="topicInfo.author"></div>
            </div>
            <v-btn
              @click="modifyTopic"
              icon
              v-if="
                $store.state.isLogin === true &&
                  $store.state.userInfo.id === topicInfo.userid
              "
            >
              <v-icon>far fa-edit</v-icon>
            </v-btn>
          </div>

          <v-divider></v-divider>
          <div>
            <v-card-title v-text="topicInfo.title"></v-card-title>
            <v-card-text v-html="topicInfo.content"></v-card-text>
          </div>
        </div>
      </v-card>
    </div>
    <v-card v-for="(item, index) in replyData" :key="index" class="my-1">
      <div class="d-flex flex-row align-center justify-space-between">
        <div class="ma-1">
          <v-avatar>
            <v-img :src="item.authoravatar"></v-img>
          </v-avatar>
          <div v-text="item.author"></div>
        </div>
        <div>
          <v-btn
            @click="modifyReply(index)"
            icon
            v-if="
              $store.state.isLogin === true &&
                $store.state.userInfo.id === item.userid
            "
          >
            <v-icon>far fa-edit</v-icon>
          </v-btn>
          #<span v-text="item.serial"></span>
        </div>
      </div>
      <v-divider></v-divider>
      <div class="d-flex flex-row">
        <v-card-text v-html="item.content"></v-card-text>
      </div>
    </v-card>
    <v-btn
      width="100%"
      class="mt-3"
      @click="fetchReplyData"
      v-text="moreButton"
    >
    </v-btn>
    <v-bottom-sheet v-model="sheet">
      <v-sheet height="500px">
        <div class="pa-3">
          <my-quill-editor
            v-model="content"
            :costumeStyle="{
              height: 350 + 'px',
              marginBottom: 70 + 'px'
            }"
          ></my-quill-editor>
        </div>
        <v-btn @click="submitContent" s>回复</v-btn>
      </v-sheet>
    </v-bottom-sheet>
    <v-tooltip top v-if="$store.state.isLogin === true">
      <template v-slot:activator="{ on, attr }">
        <v-btn
          fab
          fixed
          right
          bottom
          class="ma-3"
          v-bind="attr"
          color="green lighten-1"
          v-on="on"
          @click="sheet = !sheet"
        >
          <v-icon color="white">fas fa-plus</v-icon>
        </v-btn>
      </template>
      <span>添加回复</span>
    </v-tooltip>
    <v-dialog v-model="dialog" @click:outside="dialog = false">
      <v-card class="pa-6 text-center">
        <div>
          <v-text-field
            v-if="selectedIndex == null"
            label="标题"
            counter
            v-model="title"
            :rules="[
              () => title.length <= 255 || '最长为255字符',
              () => !!title || '标题不能为空'
            ]"
          >
          </v-text-field>
        </div>
        <div>
          <my-quill-editor
            v-model="modifyContent"
            :costumeStyle="{
              height: 350 + 'px',
              marginBottom: 70 + 'px'
            }"
          ></my-quill-editor>
        </div>

        <v-btn class="mt-4" @click="submitModifyContent">修改</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import MyQuillEditor from "../components/MyQuillEditor";
export default {
  name: "Topic",
  components: { MyQuillEditor },
  data: () => {
    return {
      topicInfo: Object,
      replyData: [],
      sheet: false,
      content: "",
      modifyContent: "",
      moreButton: "加载更多",
      dialog: false,
      title: "",
      selectedIndex: null
    };
  },
  methods: {
    fetchTopicData() {
      this.$axios
        .get("/api/topic?topicId=" + this.$route.params.topicId)
        .then(res => {
          if (res.data.code === 200) {
            this.topicInfo = res.data.data;
            this.fetchReplyData();
          } else {
            this.$router.push({ name: "NotFound" });
          }
        });
    },
    fetchReplyData() {
      let replyNum = this.replyData.length,
        serial = 0;
      if (replyNum > 0) {
        serial = this.replyData[this.replyData.length - 1].serial;
      }
      this.$axios
        .get(
          "/api/reply?topicId=" +
            this.$route.params.topicId +
            "&page=" +
            (Math.floor(replyNum / 20) + 1)
        )
        .then(res => {
          for (let item of res.data.data.replyData) {
            if (item.serial > serial) {
              this.replyData.push(item);
            }
          }
          if (res.data.data.replyNum > this.replyData.length) {
            this.moreButton = "加载更多";
          } else {
            this.moreButton = "(已加载取全部回复)尝试加载更多";
          }
        });
    },
    submitContent() {
      this.$axios
        .post(
          "/api/reply",
          this.$qs.stringify({
            topicId: this.$route.params.topicId,
            content: this.content
          })
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "回复成功"
            });
            this.sheet = false;
            this.content = "";
          }
        });
    },
    submitModifyContent() {
      if (this.selectedIndex === null) {
        this.$axios
          .put(
            "/api/topic",
            this.$qs.stringify({
              topicId: this.topicInfo.id,
              title: this.title,
              content: this.modifyContent
            })
          )
          .then(res => {
            this.judgeRes(res);
            this.topicInfo.content = this.modifyContent;
          });
      } else {
        this.$axios
          .put(
            "/api/reply",
            this.$qs.stringify({
              replyId: this.replyData[this.selectedIndex].id,
              content: this.modifyContent
            })
          )
          .then(res => {
            this.judgeRes(res);
            this.replyData[this.selectedIndex].content = this.modifyContent;
          });
      }
    },
    modifyTopic() {
      this.dialog = true;
      this.selectedIndex = null;
      this.title = this.topicInfo.title;
      this.modifyContent = this.topicInfo.content;
    },
    modifyReply(index) {
      this.dialog = true;
      this.selectedIndex = index;
      this.modifyContent = this.replyData[index].content;
    },
    judgeRes(res) {
      if (res.data.code === 200) {
        this.$store.commit("showSnackbar", {
          color: "success",
          text: "修改成功"
        });
        this.dialog = false;
      } else {
        this.$store.commit("showSnackbar", {
          color: "error",
          text: "修改失败"
        });
      }
    }
  },
  created() {
    this.fetchTopicData();
  }
};
</script>

<style scoped></style>
