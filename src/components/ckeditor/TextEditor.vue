<template>
  <div class="text_editor">
    <ckeditor
      @ready="onEditorReady"
      :editor="editor"
      v-model="content"
      :config="config"
      :disabled="!editable"
    ></ckeditor>
  </div>
</template>

<script>
import CKEditor from "@ckeditor/ckeditor5-vue2";
import CustomEditor from "./ckeditor2";
import { firebaseUpload } from "@/plugins/firebase";

export default {
  components: {
    ckeditor: CKEditor.component,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    value(val) {
      if (this.editorReady) {
        this.content = val;
      } else {
        this.tmpContent = val;
      }
    },
    content(val) {
      this.$emit("input", val);
    },
  },
  mounted() {
    this.content = this.value || "";
  },
  data() {
    return {
      uploading: false,
      editor: CustomEditor,
      editorReady: false,
      content: "",
      tmpContent: "",
      config: {
        placeholder: this.placeholder,
        toolbar: [
          "imageUpload",
          "bold",
          "link",
          "|",
          "alignment:left",
          "alignment:center",
          "|",
          "bulletedList",
          "numberedList",
          "|",
          "fontBackgroundColor",
          "mediaEmbed",
          "insertTable",
          "|",
          "undo",
          "redo",
          "code",
          "codeBlock",
          "|",
          "underline",
          "fontSize",
        ],
        fillEmptyBlocks: false,
        language: "vn",
        mediaEmbed: {
          previewsInData: true,
        },
        extraPlugins: [createUploadAdapter],
      },
    };
  },
  methods: {
    uploader(editor) {
      editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        return new UploadAdapter(loader);
      };
    },
    onEditorReady() {
      this.editorReady = true;
      this.content = this.tmpContent;
    },
  },
};
function createUploadAdapter(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new UploadAdapter(loader);
  };
}

class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(async (file) => {
      var fileName = `${Date.now()}-${file.name}`;
      var url = await firebaseUpload(file, fileName);
      return {
        default: url,
      };
    });
  }
}
</script>

<style lang="scss">
.text_editor {
  .ck-editor__editable {
    min-height: 150px;
    border: 2px solid !important;
    border-radius: 1rem !important;
    margin-top: 2px !important;
    background-color: #eeeeee;
    p {
      margin: 0px;
      padding: 0px;
    }
  }

  .v-btn {
    .v-btn__content {
      font-weight: 500;
      font-size: 0.75rem;
    }
  }
}
</style>
