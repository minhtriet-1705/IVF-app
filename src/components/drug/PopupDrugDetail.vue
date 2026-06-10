<template>
  <v-dialog
    v-model="isShow"
    fullscreen
    transition="dialog-bottom-transition"
    eager
  >
    <v-card class="custom grey">
      <div style="max-width: 700px; margin: 0px auto 0 auto">
        <v-btn
          @click="
            isShow = false;
            resolve(false);
          "
          class="btn_close mt-5"
          elevation="0"
          fixed
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-text>
          <v-card-title class="pt-5">
            {{ $t("common.info") }} {{ $t("medicine.medicine") }}
          </v-card-title>
          <drug-detail ref="DrugDetail" @onCreate="onCreate" />
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import DrugDetail from "./DrugDetail.vue";

export default {
  components: {
    DrugDetail,
  },
  data() {
    return {
      isShow: false,
      resolve: null,
    };
  },
  methods: {
    async onCreate(data) {
      this.$emit("onCreate", data);
      this.isShow = false;
    },
    async open() {
      this.isShow = true;
      this.$refs.DrugDetail.clean();
      await this.sleep(50);
      await this.$refs.DrugDetail.view();
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    async view(id = "") {
      id = id || "";
      this.isShow = true;
      this.$refs.DrugDetail.clean();
      await this.sleep(50);
      await this.$refs.DrugDetail.view(id);
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    async edit(id = "") {
      if (!id) return;
      this.isShow = true;
      this.$refs.DrugDetail.clean();
      await this.sleep(50);
      await this.$refs.DrugDetail.edit(id);
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
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
