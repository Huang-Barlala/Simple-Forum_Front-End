<template>
  <tinymce-vue
    :init="init"
    v-model="content"
    @input="$emit('input', content)"
  ></tinymce-vue>
</template>

<script>
import Editor from "@tinymce/tinymce-vue";
import axios from "axios";

export default {
  components: { "tinymce-vue": Editor },
  name: "MyTinymce",
  model: { prop: "value", event: "input" },
  props: { value: String },
  data: () => {
    const $upLoadImage = (blobinfo, success, failure) => {
      if (blobinfo.blob().size > 1024 * 1024 * 10) {
        failure("文件体积过大");
      }
      let pattern = /image\/\w+/;
      if (pattern.test(blobinfo.blob().type)) {
        let formData = new FormData();
        formData.append("file", blobinfo.blob());
        axios({
          method: "POST",
          url: "/api/uploadImage",
          data: formData
        })
          .then(res => {
            console.log(res.data.data);
            success(res.data.data);
          })
          .catch(() => {
            failure("上传失败");
          });
      } else {
        failure("图片格式错误");
      }
    };
    return {
      init: {
        toolbar:
          "undo redo | fullscreen | formatselect alignleft aligncenter alignright alignjustify | link unlink | numlist bullist | image media table | fontselect fontsizeselect forecolor backcolor | bold italic underline strikethrough | indent outdent | superscript subscript | removeformat |",
        toolbar_drawer: "sliding",
        quickbars_selection_toolbar:
          "removeformat | bold italic underline strikethrough | fontsizeselect forecolor backcolor",
        plugins: "link image media table lists fullscreen quickbars",
        language: "zh_CN",
        language_url: "/langs/zh_CN.js",
        resize: false,
        images_upload_handler: (blobinfo, success, failure) => {
          $upLoadImage(blobinfo, success, failure);
        },
        elementpath: false
      },
      content: ""
    };
  },
  methods: {
    updata() {
      console.log("我");
      this.$emit("input", this.content);
    }
  }
};
</script>

<style scoped></style>
