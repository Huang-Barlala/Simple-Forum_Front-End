<template>
  <div>
    <div>
      <v-card>
        <div class="d-flex flex-row my-4" style="min-height: 250px">
          <div id="authorInfo">
            <div v-text="topicInfo.author"></div>
          </div>
          <div>
            <v-card-title v-text="topicInfo.title"></v-card-title>
            <v-card-text v-html="topicInfo.content"></v-card-text>
          </div>
        </div>
      </v-card>
    </div>
    <v-card v-for="(item, index) in replyData" :key="index" class="my-1">
      <div class="d-flex flex-row">
        <v-card-text v-html="item.content"></v-card-text>
        <div>#<span v-text="item.serial"></span></div>
      </div>
    </v-card>
    <v-btn
      width="100%"
      class="mt-3"
      @click="fetchReplyData"
      v-text="moreButton"
    >
    </v-btn>
    <div class="text-center mt-5">
      <v-btn v-if="$store.state.isLogin === true" @click="sheet = !sheet"
        >回复
      </v-btn>
    </div>
    <v-bottom-sheet v-model="sheet">
      <v-sheet height="500px">
        <my-tinymce v-model="content"></my-tinymce>
        <v-btn @click="submitContent">回复</v-btn>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

<script>
import MyTinymce from "../components/MyTinymce";
export default {
  name: "Topic",
  components: { MyTinymce },
  data: () => {
    return {
      topicInfo: Object,
      replyData: [],
      sheet: false,
      content: "1",
      moreButton: "加载更多"
    };
  },
  methods: {
    fetchTopicData() {
      let $this = this;
      let topicId = this.$route.params.topicId;
      $this.$axios
        .get("/api/getTopic?topicId=" + topicId)
        .then(function(response) {
          $this.topicInfo = response.data.data;
        });
    },
    fetchReplyData() {
      let replyNum = this.replyData.length,
        serial = 0;
      if (replyNum > 1) {
        serial = this.replyData[this.replyData.length - 1].serial;
      }
      this.$axios
        .get(
          "/api/getReply?topicId=" +
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
          "/api/addReply",
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
    }
  },
  created() {
    this.fetchTopicData();
    this.fetchReplyData();
  },
  mounted() {}
};
</script>

<style scoped></style>
