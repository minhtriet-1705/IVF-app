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
          <v-card-title class="pt-5">{{ $t("user.profile") }}</v-card-title>
          <v-text-field
            v-model="phone"
            clearable
            type="number"
            :label="$t('user.phone') + ' *'"
            filled
            outlined
            required
            hide-details
            v-mask="'############'"
            color="primary"
          ></v-text-field>
          <v-text-field
            v-model="fullName"
            clearable
            :label="$t('user.fullName') + ' *'"
            filled
            outlined
            required
            hide-details
            color="primary"
          ></v-text-field>
          <v-btn
            block
            class="btn_login mb-5 text-uppercase"
            :loading="loading"
            style="margin-top: 15px"
            @click="save"
            dark
          >
            <v-icon class="mr-3" small>mdi-check</v-icon>
            {{ $t("common.confirmed") }}
          </v-btn>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      isShow: false,
      resolve: null,
      phone: "",
      fullName: "",
      loading: false,
    };
  },
  methods: {
    async open(phone = "") {
      this.isShow = true;
      this.clean();
      this.phone = phone || "";
      if (phone) {
        this.loading = true;
        this.fullName = await this.$dbGet(`hotlines/${phone}`);
        this.loading = false;
      }
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    async save() {
      if (!this.phone || !this.fullName) return;
      this.loading = true;
      await this.$dbSet(`hotlines/${this.phone}`, this.fullName);
      this.$emit("save", this.phone);
      this.loading = false;
      this.resolve(true);
      this.isShow = false;
    },
    clean() {
      this.phone = "";
      this.fullName = "";
      this.loading = false;
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
