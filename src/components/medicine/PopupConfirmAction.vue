<template>
  <div class="ble_measuring_container" v-show="isShow">
    <div style="width: 100%">
      <v-btn
        @click="isShow = false"
        class="btn_close mt-5"
        elevation="0"
        fixed
        icon
        style="right: 20px"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <div v-show="!isDone">
        <v-card-title class="pt-5"
          >{{ medicineName || $t("common.confirm") }}:</v-card-title
        >
        <lottie-loader
          :url="'/lottie/episode.json'"
          :width="'120px'"
          style="margin-top: -20px"
        />
        <h3 class="text-center mb-4" style="margin-top: -10px">
          {{ $t("medicine.shareyourthought") }}:
        </h3>
        <text-editor v-model="contentDetail" />
        <v-btn
          block
          dark
          class="mt-3 pa-8"
          rounded
          :loading="loading"
          @click="save"
        >
          {{ $t("common.confirm") }}
        </v-btn>
      </div>
      <div v-show="isDone">
        <lottie-loader
          :url="'/lottie/heart.json'"
          :width="'100%'"
          style="position: absolute; top: 0"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import TextEditor from "@/components/ckeditor/TextEditor.vue";
import LottieLoader from "@/components/LottieLoader.vue";

export default {
  props: {
    allowPatientList: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    TextEditor,
    LottieLoader,
  },
  data() {
    return {
      medicineName: "",
      isShow: false,
      resolve: null,
      loading: false,
      isDone: false,
      contentDetail: "",
      actionId: null,
      actionType: "cancel",
    };
  },
  methods: {
    async open(actionId, actionType = "done", medicineName) {
      this.clean();
      this.medicineName = medicineName;
      this.isShow = true;
      this.actionId = actionId;
      this.actionType = actionType;
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    clean() {
      this.medicineName = "";
      this.loading = false;
      this.isDone = false;
      this.contentDetail = "";
      this.actionId = null;
      this.actionType = "cancel";
    },
    async save() {
      this.loading = true;
      axios.post(
        `https://us-central1-ivf-app-new.cloudfunctions.net/ivf_notifyAction`,
        {
          actionId: this.actionId,
          phone: this.$phone,
          actionType: this.actionType,
          ContentDetail: this.contentDetail,
        }
      );
      this.loading = false;
      this.isDone = true;
      this.$emit("done", this.actionId);
      await this.sleep(1500);
      this.resolve(true);
      this.isShow = false;
    },
    cancel() {
      this.resolve(false);
      this.isShow = false;
    },
  },
};
</script>

<style lang="scss">
.v-dialog {
  .v-card__text {
    font-size: 1rem;
  }
}
</style>
