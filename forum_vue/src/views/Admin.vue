<template>
  <div>
    <v-dialog
      @click:outside="dialogs.delete = false"
      v-model="dialogs.delete"
      width="200px"
    >
      <v-card class="text-center py-5">
        <div class="my-1">是否删除</div>
        <v-btn @click="deleteItem" class="mx-1 " color="error">是</v-btn>
        <v-btn @click="dialogs.delete = false" class="mx-1">否</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog @click:outside="dialogs.modify = false" v-model="dialogs.modify">
      <v-card class="pa-6 text-center">
        <v-row v-if="tabs === 1">
          <v-col cols="2">
            <v-select :items="sectionsInfo" v-model="selectValue"></v-select>
          </v-col>
          <v-col cols="10">
            <v-text-field
              :rules="[
                () => texts.title.length <= 255 || '最长为255字符',
                () => !!texts.title || '标题不能为空'
              ]"
              counter
              label="标题"
              v-model="texts.title"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <div>
          <my-quill-editor
            :costumeStyle="{
              height: 350 + 'px',
              marginBottom: 70 + 'px'
            }"
            v-model="texts.content"
          ></my-quill-editor>
        </div>
        <v-btn @click="updateItem" class="mt-4">修改</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog
      @click:outside="dialogs.editSection = false"
      max-width="600px"
      v-model="dialogs.editSection"
    >
      <v-card class="pa-5">
        <v-text-field
          :rules="[
            () => texts.title.length <= 20 || '最长为20字符',
            () => !!texts.title || '不能为空'
          ]"
          label="板块名"
          v-model="texts.title"
        ></v-text-field>
        <v-btn @click="updateSection" v-if="!isInsert">修改</v-btn>
        <v-btn @click="insertSection" v-else>添加</v-btn>
      </v-card>
    </v-dialog>
    <v-tabs v-model="tabs">
      <v-tab>Section</v-tab>
      <v-tab>Topic</v-tab>
      <v-tab>Reply</v-tab>
      <v-tab>User</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabs">
      <v-tab-item>
        <div class="d-flex flex-row align-center">
          <v-text-field
            append-icon="fas fa-search"
            hide-details
            label="搜索"
            single-line
            v-model="texts.search.section"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              isInsert = true;
              texts.title = '';
              dialogs.editSection = true;
            "
            >添加
          </v-btn>
        </div>
        <v-data-table
          :headers="headers.section"
          :items="items.section"
          :items-per-page="itemsPerPage"
          :loading="loading"
          :page.sync="pages.page.section"
          :search="texts.search.section"
          @page-count="pages.length.section = $event"
          calculate-widths
          hide-default-footer
        >
          <template v-slot:item.action="{ item }">
            <v-icon @click="$router.push('/section/' + item.id)" class="mr-3"
              >far fa-eye
            </v-icon>
            <v-icon
              @click="
                isInsert = false;
                selectedId = item.id;
                texts.title = item.name;
                dialogs.editSection = true;
              "
              class="mr-3"
              >far fa-edit
            </v-icon>
            <v-icon
              @click="
                selectedId = item.id;
                dialogs.delete = true;
              "
              class="mr-3"
              >far fa-trash-alt
            </v-icon>
          </template>
        </v-data-table>
        <div class="text-center">
          <v-pagination
            :length="pages.length.section"
            v-model="pages.page.section"
          ></v-pagination>
        </div>
      </v-tab-item>
      <v-tab-item>
        <v-text-field
          @input="fetchTopic"
          append-icon="fas fa-search"
          hide-details
          label="搜索"
          single-line
          v-model="texts.search.topic"
        ></v-text-field>
        <v-data-table
          :headers="headers.topic"
          :items="items.topic"
          :items-per-page="itemsPerPage"
          :loading="loading"
          :options="options"
          :page="pages.page.topic"
          :server-items-length="pages.length.topic"
          @update:options="
            orderOption.topic.order = $event.sortBy[0];
            orderOption.topic.desc = $event.sortDesc[0];
            fetchTopic();
          "
          hide-default-footer
        >
          <template v-slot:item.action="{ item }">
            <v-icon @click="$router.push('/topic/' + item.id)" class="mr-3"
              >far fa-eye
            </v-icon>
            <v-icon @click="editTopic(item)" class="mr-3">far fa-edit</v-icon>
            <v-icon
              @click="
                selectedId = item.id;
                dialogs.delete = true;
              "
              class="mr-3"
              >far fa-trash-alt
            </v-icon>
          </template>
        </v-data-table>
        <div class="text-center">
          <v-pagination
            :length="pages.length.topic"
            @input="fetchTopic"
            v-model="pages.page.topic"
          ></v-pagination>
        </div>
      </v-tab-item>
      <v-tab-item>
        <v-text-field
          @input="fetchReply"
          append-icon="fas fa-search"
          hide-details
          label="搜索"
          single-line
          v-model="texts.search.reply"
        ></v-text-field>
        <v-data-table
          :headers="headers.reply"
          :items="items.reply"
          :items-per-page="itemsPerPage"
          :loading="loading"
          :options="options"
          :page="pages.page.reply"
          :server-items-length="pages.length.reply"
          @update:options="
            orderOption.reply.order = $event.sortBy[0];
            orderOption.reply.desc = $event.sortDesc[0];
            fetchReply();
          "
          hide-default-footer
        >
          <template v-slot:item.action="{ item }">
            <v-icon @click="editReply(item)" class="mr-3">far fa-edit</v-icon>
            <v-icon
              @click="
                selectedId = item.id;
                dialogs.delete = true;
              "
              class="mr-3"
              >far fa-trash-alt
            </v-icon>
          </template>
        </v-data-table>
        <div class="text-center">
          <v-pagination
            :length="pages.length.reply"
            @input="fetchReply"
            v-model="pages.page.reply"
          ></v-pagination>
        </div>
      </v-tab-item>
      <v-tab-item>
        <v-text-field
          @input="fetchUser"
          append-icon="fas fa-search"
          hide-details
          label="搜索"
          single-line
          v-model="texts.search.user"
        ></v-text-field>
        <v-data-table
          :headers="headers.user"
          :items="items.user"
          :items-per-page="itemsPerPage"
          :loading="loading"
          :options="options"
          :page="pages.page.user"
          :server-items-length="pages.length.user"
          @update:options="
            orderOption.user.order = $event.sortBy[0];
            orderOption.user.desc = $event.sortDesc[0];
            fetchUser();
          "
          hide-default-footer
        >
          <template v-slot:item.action="{ item }">
            <v-icon
              @click="
                selectedId = item.id;
                dialogs.delete = true;
              "
              class="mr-3"
              >far fa-trash-alt
            </v-icon>
          </template>
        </v-data-table>
        <div class="text-center">
          <v-pagination
            :length="pages.length.user"
            @input="fetchUser"
            v-model="pages.page.user"
          ></v-pagination></div
      ></v-tab-item>
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
      items: { section: [], topic: [], reply: [], user: [] },
      sectionsInfo: [{ text: "none", value: 0, disabled: true }],
      texts: {
        title: "",
        content: "",
        search: { section: "", topic: "", reply: "", user: "" }
      },
      dialogs: {
        modify: false,
        delete: false,
        editSection: false
      },
      pages: {
        page: { section: 1, topic: 1, reply: 1, user: 1 },
        length: { section: 1, topic: 1, reply: 1, user: 1 }
      },
      selectedId: null,
      itemsPerPage: 20,
      loading: true,
      options: {},
      orderOption: {
        topic: { order: null, desc: null },
        reply: { order: null, desc: null },
        user: { order: null, desc: null }
      },
      selectValue: null,
      isInsert: false,
      headers: {
        section: [
          { text: "板块ID", align: "start", value: "id" },
          { text: "板块名", value: "name", align: "center" },
          { text: "操作", value: "action", sortable: false, align: "end" }
        ],
        topic: [
          { text: "主题ID", align: "start", value: "id" },
          { text: "板块ID", value: "sectionId" },
          { text: "用户ID", value: "userId" },
          { text: "用户名", value: "author" },
          { text: "标题", value: "title" },
          { text: "创建日期", value: "createTime" },
          { text: "修改日期", value: "modifyTime" },
          { text: "最后回复日期", value: "replyTime" },
          { text: "操作", value: "action", sortable: false }
        ],
        reply: [
          { text: "回复ID", value: "id", align: "start" },
          { text: "主题ID", value: "topicId" },
          { text: "用户ID", value: "userId" },
          { text: "用户名", value: "author" },
          { text: "创建日期", value: "createTime" },
          { text: "修改日期", value: "modifyTime" },
          { text: "回复序号", value: "serial", sortable: false },
          { text: "操作", value: "action", sortable: false }
        ],
        user: [
          { text: "用户ID", value: "id" },
          { text: "用户名", value: "username" },
          { text: "邮箱", value: "email" },
          { text: "创建日期", value: "createTime" },
          { text: "主题数", value: "topicNum" },
          { text: "用户权限", value: "permission" },
          { text: "操作", value: "action", sortable: false }
        ]
      }
    };
  },
  mounted() {
    this.fetchSection();
  },
  methods: {
    getSectionInfo() {
      if (this.items.section.length !== 0) {
        this.sectionsInfo = [];
        for (let item of this.items.section) {
          this.sectionsInfo.push({
            disabled: false,
            text: item.name,
            value: item.id
          });
        }
      } else {
        this.fetchSection();
      }
    },
    fetchSection() {
      this.loading = true;
      this.$axios
        .get("/api/sections")
        .then(res => {
          if (res.data.code === 200) {
            this.items.section = res.data.data;
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    fetchTopic() {
      this.loading = true;
      let order =
        this.orderOption.topic.order == null
          ? "id"
          : this.orderOption.topic.order;
      let desc =
        this.orderOption.topic.desc == null
          ? false
          : this.orderOption.topic.desc;
      this.$axios
        .get("/api/allTopicPageNum?&search=" + this.texts.search.topic.trim())
        .then(res => {
          if (res.data.code === 200) {
            this.pages.length.topic = res.data.data;
            if (this.pages.length.topic === 0) {
              this.loading = false;
            } else {
              this.$axios
                .get(
                  "/api/allTopic?page=" +
                    this.pages.page.topic +
                    "&order=" +
                    order +
                    "&desc=" +
                    desc +
                    "&search=" +
                    this.texts.search.topic.trim()
                )
                .then(res => {
                  if (res.data.code === 200) {
                    this.items.topic = res.data.data;
                    this.loading = false;
                  }
                });
            }
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "获取数据失败"
            });
            this.loading = false;
          }
        })
        .catch(() => {
          return 0;
        });
    },
    fetchReply() {
      this.loading = true;
      let order =
        this.orderOption.reply.order == null
          ? "id"
          : this.orderOption.reply.order;
      let desc =
        this.orderOption.reply.desc == null
          ? false
          : this.orderOption.reply.desc;
      this.$axios
        .get("/api/allReplyPageNum?&search=" + this.texts.search.reply.trim())
        .then(res => {
          if (res.data.code === 200) {
            this.pages.length.reply = res.data.data;
            if (this.pages.length.reply === 0) {
              this.loading = false;
            } else {
              this.$axios
                .get(
                  "/api/allReply?page=" +
                    this.pages.page.reply +
                    "&order=" +
                    order +
                    "&desc=" +
                    desc +
                    "&search=" +
                    this.texts.search.reply.trim()
                )
                .then(res => {
                  if (res.data.code === 200) {
                    this.items.reply = res.data.data;
                    this.loading = false;
                  }
                });
            }
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "获取数据失败"
            });
            this.loading = false;
          }
        })
        .catch(() => {
          return 0;
        });
    },
    fetchUser() {
      this.loading = true;
      let order =
        this.orderOption.user.order == null
          ? "id"
          : this.orderOption.user.order;
      let desc =
        this.orderOption.user.desc == null ? false : this.orderOption.user.desc;
      this.$axios
        .get("/api/allUserPageNum?&search=" + this.texts.search.user.trim())
        .then(res => {
          if (res.data.code === 200) {
            this.pages.length.user = res.data.data;
            if (this.pages.length.user === 0) {
              this.loading = false;
            } else {
              this.$axios
                .get(
                  "/api/allUser?page=" +
                    this.pages.page.user +
                    "&order=" +
                    order +
                    "&desc=" +
                    desc +
                    "&search=" +
                    this.texts.search.user.trim()
                )
                .then(res => {
                  if (res.data.code === 200) {
                    this.items.user = res.data.data;
                    this.loading = false;
                  }
                });
            }
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "获取数据失败"
            });
            this.loading = false;
          }
        });
    },

    insertSection() {
      this.$axios
        .post("/api/section", this.$qs.stringify({ name: this.texts.title }))
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "添加成功"
            });
            this.dialogs.editSection = false;
            this.fetchSection();
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "添加失败"
            });
          }
        });
    },

    updateItem() {
      switch (this.tabs) {
        case 1:
          this.updateTopic();
          break;
        case 2:
          this.updateReply();
          break;
        default:
      }
    },
    updateSection() {
      this.$axios
        .put(
          "/api/section",
          this.$qs.stringify({ id: this.selectedId, name: this.texts.title })
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "修改成功"
            });
            this.dialogs.editSection = false;
            this.fetchSection();
          } else {
            console.log(res);
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "修改失败"
            });
          }
        });
    },
    updateTopic() {
      this.$axios
        .put(
          "/api/topic",
          this.$qs.stringify({
            id: this.selectedId,
            title: this.texts.title,
            content: this.texts.content,
            sectionId: this.selectValue
          })
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "修改成功"
            });
            this.dialogs.modify = false;
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "修改失败"
            });
          }
        });
    },
    updateReply() {
      this.$axios
        .put(
          "/api/reply",
          this.$qs.stringify({
            id: this.selectedId,
            content: this.texts.content
          })
        )
        .then(res => {
          if (res.data.code === 200) {
            this.$store.commit("showSnackbar", {
              color: "success",
              text: "修改成功"
            });
            this.dialogs.modify = false;
          } else {
            this.$store.commit("showSnackbar", {
              color: "error",
              text: "修改失败"
            });
          }
        });
    },

    deleteItem() {
      switch (this.tabs) {
        case 0:
          this.deleteSection();
          break;
        case 1:
          this.deleteTopic();
          break;
        case 2:
          this.deleteReply();
          break;
        case 3:
          this.deleteUser();
          break;
        default:
      }
    },
    deleteSection() {
      this.$axios.delete("/api/section?id=" + this.selectedId).then(res => {
        if (res.data.code === 200) {
          this.$store.commit("showSnackbar", {
            color: "success",
            text: "删除成功"
          });
          this.dialogs.delete = false;
          this.fetchSection();
        }
      });
    },
    deleteTopic() {
      this.dialogs.delete = false;
      this.$axios.delete("/api/topic" + "?id=" + this.selectedId).then(res => {
        if (res.data.code === 200) {
          this.$store.commit("showSnackbar", {
            color: "success",
            text: "删除成功"
          });
          this.fetchTopic();
        }
      });
    },
    deleteReply() {
      this.$axios.delete("/api/reply?id=" + this.selectedId).then(res => {
        if (res.data.code === 200) {
          this.$store.commit("showSnackbar", {
            color: "success",
            text: "删除成功"
          });
          this.fetchReply();
        } else {
          this.$store.commit("showSnackbar", {
            color: "error",
            text: "删除失败"
          });
        }
        this.dialogs.delete = false;
      });
    },
    deleteUser() {
      this.$axios.delete("/api/user?id=" + this.selectedId).then(res => {
        if (res.data.code === 200) {
          this.$store.commit("showSnackbar", {
            color: "success",
            text: "删除成功"
          });
          this.fetchUser();
        } else {
          this.$store.commit("showSnackbar", {
            color: "error",
            text: "删除失败"
          });
        }
        this.dialogs.delete = false;
      });
    },

    editTopic(item) {
      this.dialogs.modify = true;
      this.selectedId = item.id;
      this.texts.title = item.title;
      this.selectValue = item.sectionId;
      this.$axios.get("/api/topic?id=" + item.id).then(res => {
        if (res.data.code === 200) {
          this.texts.content = res.data.data.content;
        }
      });
      this.getSectionInfo();
    },
    editReply(item) {
      this.dialogs.modify = true;
      this.selectedId = item.id;
      this.$axios.get("/api/reply?id=" + this.selectedId).then(res => {
        console.log(res.data);
        if (res.data.code === 200) {
          this.texts.content = res.data.data.content;
        }
      });
    }
  }
};
</script>

<style scoped></style>
