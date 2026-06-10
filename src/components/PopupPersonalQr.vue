<template>
  <v-dialog v-model="isShow" :max-width="isNative ? 320 : 460">
    <v-card class="custom popup_qr">
      <v-card-text class="text-center pt-10 pb-7 pl-3 pr-3">
        <vue-qr :text="personalQrUri" :size="isNative ? 260 : 360"></vue-qr>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import VueQr from "vue-qr";

export default {
  components: { VueQr },
  computed: {
    personalQrUri() {
      var phone = this.$store.getters["Authen/getUser"].phone || "";
      phone = `https://huyetap.phongkham.co/?PHONE=${this.formatPhoneNumber(
        phone
      )}`;
      console.log(phone);
      return phone;
    },
  },
  data() {
    return {
      isShow: false,
      resolve: null,
    };
  },
  methods: {
    confirm() {
      this.isShow = true;
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    agree() {
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
.popup_qr {
  img {
    width: 100%;
  }
}
</style>
