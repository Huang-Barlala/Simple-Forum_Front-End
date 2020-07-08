<template>
  <div class="text-center">
    <v-form ref="title">
      <v-text-field
        label="标题"
        counter
        v-model="title"
        :rules="[
          () => title.length <= 255 || '最长为255字符',
          () => !!title || '标题不能为空'
        ]"
      >
      </v-text-field>
    </v-form>
    <div style="height: 600px">
      <my-quill-editor
        v-model="content"
        :costumeStyle="{
          height: 600 + 'px'
        }"
      ></my-quill-editor>
    </div>

    <v-btn @click="addTopic" class="mt-4">发布</v-btn>
  </div>
</template>

<script>
import MyQuillEditor from "../components/MyQuillEditor";
export default {
  name: "AddTopic",
  components: { MyQuillEditor },
  data: () => {
    return {
      title: "",
      content: ""
    };
  },
  methods: {
    addTopic() {
      if (this.$refs.title.validate()) {
        if (this.content === "") {
          this.$store.commit("showSnackbar", {
            color: "orange",
            text: "主题内容不能为空"
          });
        } else {
          this.$axios
            .post(
              "/api/topic",
              this.$qs.stringify({
                sectionId: this.$route.params.sectionId,
                title: this.title,
                content: this.content
              })
            )
            .then(res => {
              if (res.data.code === 200) {
                this.$store.commit("showSnackbar", {
                  color: "success",
                  text: "回复成功"
                });
                this.$router.back();
              } else {
                this.$store.commit("showSnackbar", {
                  color: "error",
                  text: res.data.msg
                });
              }
            });
        }
      }
    }
  },
  mounted() {
    if (this.$route.params.sectionId == null) {
      this.$store.commit("showSnackbar", {
        color: "orange",
        text: "错误来源" + " 自动转跳至首页"
      });
      this.$router.push("/");
    }
  }
};
</script>

<style scoped></style>
