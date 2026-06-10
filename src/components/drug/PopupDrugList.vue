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
            {{ $t("common.choose") }} {{ $t("medicine.medicine") }}
          </v-card-title>
          <drug-list v-model="value" ref="DrugList" :editable="editable" />
          <v-btn
            dark
            block
            style="height: 36px !important"
            class="mt-3 text-uppercase"
            @click="
              isShow = false;
              resolve(false);
            "
          >
            <v-icon small class="mr-1">mdi-check</v-icon>
            {{ $t("common.confirm") }}
          </v-btn>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import DrugList from "./DrugList.vue";

export default {
  props: {
    value: {
      type: Array,
      default: function () {
        return [];
      },
    },
    editable: {
      type: Boolean,
      default: function () {
        true;
      },
    },
  },
  components: {
    DrugList,
  },
  data() {
    return {
      isShow: false,
      resolve: null,
    };
  },
  methods: {
    async open() {
      this.isShow = true;
      await this.sleep(50);
      this.$refs.DrugList.render();
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
