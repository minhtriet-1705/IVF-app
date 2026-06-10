<template>
  <div>
    <v-form v-if="!errored" v-model="valid" @submit.prevent="verify">
      <label class="label_title">{{ $t("register.verifyCode") }}</label>
      <v-otp-input length="6" v-model="code" type="number"></v-otp-input>
      <v-btn
        type="submit"
        color="primary"
        block
        class="btn_login text-uppercase"
        :loading="loading"
        :disabled="!valid"
      >
        {{ $t("common.confirm") }}
      </v-btn>
    </v-form>
    <div>
      <v-btn
        block
        @click="reload"
        text
        class="mt-7"
        style="
          background-color: transparent !important;
          color: black !important;
        "
      >
        {{ $t("error.retrysendcode") }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { verifyConfirmationPhoneNumber } from "@/plugins/firebase";

export default {
  data() {
    return {
      errored: false,
      valid: false,
      loading: false,
      codeRules: [(v) => v.length >= 6 || "Code is 6 characters"],
      code: "",
    };
  },
  created() {},
  methods: {
    async verify() {
      this.loading = true;
      try {
        var { phoneNumber, uid } = await verifyConfirmationPhoneNumber(
          this.code
        );
        // verify phone success!!!
        // var user = await this.$dbGet(`users/${uid}`);
        var user = await this.getUserLite(uid);
        if (user) {
          this.$store.commit("Authen/SET_USER", user);
          await this.sleep(100);
          await this.registerNotificationToken();
          return this.$router.go("/home");
        }
        this.$store.commit("Authen/SET_ID", uid);
        this.$store.commit("Authen/SET_PHONE", phoneNumber);
        this.$emit("success");
      } catch (err) {
        console.log(err);
        this.showErrorPopup("Phone Verification Failed");
        this.errored = true;
      }
      this.loading = false;
    },
    reload() {
      window.location.reload();
    },
  },
};
</script>
