<template>
  <div class="ql-snow">
    <quill-editor
      :style="costumedStyle"
      v-model="content"
      ref="myQuillEditor"
      :options="editorOptions"
    ></quill-editor>
  </div>
</template>

<script>
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import imageResize from "quill-image-resize-module";
import { container, ImageExtend, QuillWatch } from "quill-image-extend-module";
Quill.register("modules/imageResize", imageResize);
Quill.register("modules/ImageExtend", ImageExtend);
export default {
  name: "MyQuillEditor",
  model: { prop: "value", event: "input" },
  props: { value: String, costumeStyle: {} },
  components: { quillEditor },
  data: () => {
    return {
      content: "",
      editorOptions: {
        modules: {
          ImageExtend: {
            name: "file", // 图片参数名
            size: 6, // 可选参数 图片大小，单位为M，1M = 1024kb
            action: "/api/image", // 服务器地址, 如果action为空，则采用base64插入图片
            // response 为一个函数用来获取服务器返回的具体图片地址
            // 例如服务器返回{code: 200; data:{ url: 'baidu.com'}}
            // 则 return res.data.url
            response: res => {
              return res.data;
            },
            sizeError: () => {}, // 图片超过大小的回调
            start: () => {}, // 可选参数 自定义开始上传触发事件
            end: () => {}, // 可选参数 自定义上传结束触发的事件，无论成功或者失败
            error: () => {}, // 可选参数 上传失败触发的事件
            success: () => {} // 可选参数  上传成功触发的事件
          },
          toolbar: {
            // 如果不上传图片到服务器，此处不必配置
            container: container, // container为工具栏，此次引入了全部工具栏，也可自行配置
            handlers: {
              image: function() {
                // 劫持原来的图片点击按钮事件
                QuillWatch.emit(this.quill.id);
              }
            }
          },
          imageResize: {}
        }
      },
      costumedStyle: { marginBottom: null, height: null }
    };
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    }
  },
  mounted() {
    this.content = this.value;
    this.costumedStyle.marginBottom = this.costumeStyle.marginBottom;
    this.$nextTick(this.calToolbarHeight);
    window.addEventListener("resize", this.calToolbarHeight);
  },
  watch: {
    value(val) {
      this.content = val;
    },
    content(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    calToolbarHeight() {
      let height = this.costumeStyle.height;
      height = height.substring(0, height.indexOf("px"));
      if (this.$refs.myQuillEditor != null) {
        this.costumedStyle.height =
          height - this.$refs.myQuillEditor.$el.children[0].offsetHeight + "px";
      }
    }
  }
};
</script>

<style scoped></style>
