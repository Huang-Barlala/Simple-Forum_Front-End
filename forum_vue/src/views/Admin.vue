<template>
  <div>
    <v-dialog v-model="dialog2" @click:outside="dialog2 = false" width="200px">
      <v-card class="text-center py-5">
        <div class="my-1">是否删除该主题</div>
        <v-btn @click="deleteItem" class="mx-1 " color="error">是</v-btn>
        <v-btn @click="dialog2 = false" class="mx-1">否</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog" @click:outside="dialog = false">
      <v-card class="pa-6 text-center">
        <v-row>
          <v-col cols="2">
            <v-select :items="sectionsInfo" v-model="selectValue"></v-select>
          </v-col>
          <v-col cols="10">
            <v-text-field
              label="标题"
              counter
              v-model="modifyTitle"
              :rules="[
                () => modifyTitle.length <= 255 || '最长为255字符',
                () => !!modifyTitle || '标题不能为空'
              ]"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <div>
          <my-quill-editor
            v-model="modifyContent"
            :costumeStyle="{
              height: 350 + 'px',
              marginBottom: 70 + 'px'
            }"
          ></my-quill-editor>
        </div>
        <v-btn class="mt-4" @click="submitChange">修改</v-btn>
      </v-card>
    </v-dialog>
    <v-tabs v-model="tabs">
      <v-tab>Topic</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabs">
      <v-tab-item>
        <v-text-field
          v-model="search"
          label="搜索"
          single-line
          hide-details
          append-icon="fas fa-search"
          @input="getAllTopic"
        ></v-text-field>
        <v-data-table
          :headers="headers"
          :items="topicData"
          :server-items-length="pageNum"
          :loading="loading"
          :items-per-page="itemsPerPage"
          hide-default-footer
          :search="search"
          :page="page"
          :options="options"
          @update:options="getCustomTopic($event)"
        >
          <template v-slot:item.action="{ item }">
            <v-icon @click="routeToTopic(item)" class="mr-3">far fa-eye</v-icon>
            <v-icon @click="editItem(item)" class="mr-3">far fa-edit</v-icon>
            <v-icon @click="chooseItem(item)" class="mr-3"
              >far fa-trash-alt
            </v-icon>
          </template>
        </v-data-table>
        <div class="text-center">
          <v-pagination
            v-model="page"
            :length="pageNum"
            @input="getAllTopic"
          ></v-pagination>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import MyQuillEditor from "../components/MyQuillEditor";

export default {
  name: "admin",
  components: { MyQuillEditor },
  data: () => {
    return {
      tabs: null,
      sectionsInfo: [{ text: "none", value: 0, disabled: true }],
      modifyTitle: "",
      modifyContent: "",
      dialog: false,
      dialog2: false,
      selectedTopicId: null,
      search: "",
      itemsPerPage: 20,
      page: 1,
      pageNum: 1,
      topicData: [],
      loading: true,
      options: {},
      sortBy: [],
      lastOrder: null,
      lastDesc: null,
      selectValue: null,
      headers: [
        {
          text: "主题ID",
          align: "start",
          value: "id"
        },
        { text: "板块ID", value: "sectionid" },
        { text: "用户ID", value: "userid" },
        { text: "用户名", value: "author" },
        { text: "标题", value: "title" },
        { text: "创建日期", value: "createtime" },
        { text: "修改日期", value: "modifytime" },
        { text: "最后回复日期", value: "replytime" },
        { text: "操作", value: "action", sortable: false }
      ]
    };
  },
  watch: {
    options: {
      handler() {}
    }
  },
  mounted() {
    this.getSectionInfo();
    this.getAllTopic();
  },
  methods: {
    getSectionInfo() {
      this.$axios.get("/api/sections").then(res => {
        if (res.data.code === 200) {
          this.sectionsInfo = [];
          for (let item of res.data.data) {
            this.sectionsInfo.push({
              disabled: false,
              text: item.name,
              value: item.id
            });
          }
        }
      });
    },
    getAllTopic() {
      this.loading = true;
      let order = this.lastOrder == null ? "id" : this.lastOrder;
      let desc = this.lastDesc == null ? false : this.lastDesc;
      this.$axios
        .get("/api/allTopicPageNum?&search=" + this.search.trim())
        .then(res => {
          if (res.data.code === 200) {
            this.pageNum = res.data.data;
            if (this.pageNum === 0) {
              this.loading = false;
            } else {
              this.$axios
                .get(
                  "/api/allTopic?page=" +
                    this.page +
                    "&order=" +
                    order +
                    "&desc=" +
                    desc +
                    "&search=" +
                    this.search.trim()
                )
                .then(res => {
                  if (res.data.code === 200) {
                    this.topicData = res.data.data;
                    this.loading = false;
                  }
                });
            }
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "获取数据失败"
            });
          }
        })
        .catch(() => {
          return 0;
        });
    },
    getCustomTopic(event) {
      this.lastOrder = event.sortBy[0];
      this.lastDesc = event.sortDesc[0];
      this.getAllTopic();
    },
    editItem(item) {
      this.dialog = true;
      this.selectedTopicId = item.id;
      this.modifyTitle = item.title;
      this.selectValue = item.sectionid;
      this.$axios.get("/api/topic?topicId=" + item.id).then(res => {
        if (res.data.code === 200) {
          this.modifyContent = res.data.data.content;
        }
      });
    },
    deleteItem() {
      this.dialog2 = false;
      this.$axios
        .delete("/api/topic" + "?topicId=" + this.selectedTopicId)
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "删除成功"
            });
            this.getAllTopic();
          }
        });
    },
    chooseItem(item) {
      this.selectedTopicId = item.id;
      this.dialog2 = true;
    },
    routeToTopic(item) {
      this.$router.push("/topic/" + item.id);
    },
    submitChange() {
      this.$axios
        .put(
          "/api/topic",
          this.$qs.stringify({
            topicId: this.selectedTopicId,
            title: this.modifyTitle,
            content: this.modifyContent,
            sectionId: this.selectValue
          })
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "修改成功"
            });
            this.dialog = false;
          } else {
            console.log(res);
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "修改失败"
            });
          }
        });
    }
  }
};
</script>

<style scoped></style>
