<template>
  <div>
    <v-hover
      v-for="(item, index) in topicList"
      :key="index"
      v-slot:default="{ hover }"
    >
      <v-card
        :elevation="hover ? 12 : 2"
        class="my-3"
        v-ripple
        @click="goToTopic(item.id)"
      >
        <div class="d-flex flex-nowrap justify-space-between">
          <div>
            <v-card-title v-text="item.title"></v-card-title>
            <v-card-subtitle
              ><span v-text="item.author"></span
              ><span
                class="font-weight-bold"
                v-text="
                  $store.state.isLogin === true &&
                  item.userid === $store.state.userInfo.id
                    ? '(我的帖子)'
                    : ''
                "
              ></span
            ></v-card-subtitle>
          </div>
          <div
            class="d-flex flex-column justify-space-around my-2 mx-3"
            style="font-size: 12px"
          >
            <div>发表时间&nbsp;<span v-text="item.createtime"></span></div>
            <div>修改时间&nbsp;<span v-text="item.modifytime"></span></div>
            <div>回复时间&nbsp;<span v-text="item.replytime"></span></div>
          </div>
        </div>
      </v-card>
    </v-hover>
    <v-pagination v-model="page" :length="length" @input="fetchData()">
    </v-pagination>
    <v-tooltip top>
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
          @click="addTopic"
          ><v-icon color="white">fas fa-plus</v-icon></v-btn
        >
      </template>
      <span>添加主题</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "Topic",
  data: () => {
    return {
      page: 1,
      length: 1,
      topicList: []
    };
  },
  methods: {
    fetchData() {
      this.$axios
        .get(
          "/api/topicList/?sectionId=" +
            this.$route.params.sectionId +
            "&page=" +
            this.page
        )
        .then(res => {
          if (res.data.code === 200) {
            this.topicList = [];
            for (let it = 0; it < res.data.data.length; it++) {
              this.topicList.push(res.data.data[it]);
            }
          }
        });
    },
    goToTopic(id) {
      this.$router.push("/topic/" + id);
    },
    fetchPageNum() {
      this.$axios
        .get("/api/topicPageNum?sectionId=" + this.$route.params.sectionId)
        .then(res => {
          this.length = res.data.data;
          if (this.length === 0) {
            this.length = 1;
          }
        });
    },
    addTopic() {
      if (!this.$store.state.isLogin) {
        this.$store.commit("showSnackbar", {
          color: "error",
          text: "未登录"
        });
      } else {
        this.$router.push({
          name: "addTopic",
          params: {
            sectionId: this.$route.params.sectionId
          }
        });
      }
    }
  },
  created() {
    this.fetchPageNum();
    this.fetchData();
  },
  watch: {}
};
</script>

<style scoped></style>
