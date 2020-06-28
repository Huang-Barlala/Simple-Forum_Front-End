<template>
  <div>
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
    <my-tinymce style="height: 800px" v-model="content"></my-tinymce>
    <v-btn @click="addTopic">发布</v-btn>
  </div>
</template>

<script>
import MyTinymce from "../components/MyTinymce";
export default {
  name: "AddTopic",
  components: { MyTinymce },
  data: () => {
    return {
      title: "",
      content: ""
    };
  },
  methods: {
    addTopic() {
      console.log("content" + this.content);
      if (this.$refs.title.validate()) {
        if (this.content === "") {
          this.$store.commit("showSnackbar", {
            color: "orange",
            text: "主题内容不能为空"
          });
        } else {
          this.$axios
            .post(
              "/api/addTopic",
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
            })
            .catch(res => {
              console.log(res);
            });
        }
      }
    }
  }
};
</script>

<style scoped></style>
