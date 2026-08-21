<template>
  <div>
    <v-form v-if="!errored" v-model="valid" @submit.prevent="sendCode">
      <label class="label_title mb-5">{{ $t("auth.verifyphone") }}</label>
      <div class="d-flex">
        <div style="min-width: 50px; max-width: 70px; width: 20%">
          <v-text-field
            v-model="prefix"
            filled
            outlined
            color="grey lighten-1"
            required
            v-mask="'+###'"
            hide-details
            style="font-size: 1rem"
          ></v-text-field>
        </div>

        <v-text-field
          v-model="phoneNumber"
          type="number"
          :label="$t('user.phone')"
          filled
          outlined
          required
          hide-details
          color="primary"
          class="ml-1"
          style="font-size: 1.5rem"
          hide-spin-buttons
        ></v-text-field>
      </div>

      <v-btn
        type="submit"
        block
        class="btn_login mb-5 text-uppercase"
        :loading="loading"
        :disabled="!valid"
        style="margin-top: 15px"
        id="verify-phone-number-btn"
        color="primary"
      >
        {{ $t("auth.sendcode") }}
      </v-btn>
    </v-form>
    <div v-else>
      <v-btn
        type="submit"
        block
        class="btn_login mb-5 text-uppercase"
        style="margin-top: 15px"
        @click="reload"
        color="primary"
      >
        {{ $t("error.retrysendcode") }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import {
  sendConfirmationPhoneNumber,
  getRecapthaVerifierInstance,
} from "@/plugins/firebase";
import { Capacitor } from "@capacitor/core";

export default {
  data() {
    return {
      valid: false,
      loading: false,
      phoneNumber: "",
      prefix: "+84",
      errored: false,
    };
  },
  mounted() {
    getRecapthaVerifierInstance();
  },
  methods: {
    async sendCode() {
      if (!this.phoneNumber || this.phoneNumber.length < 9 || !this.prefix) {
        alert(this.$t("common.phoneNumberError"));
        return;
      }
      this.loading = true;
      try {
        var onAuthStateChange = null;
        if (
          Capacitor.isNativePlatform() &&
          Capacitor.getPlatform().toLowerCase() == "android"
        ) {
          onAuthStateChange = this.handleAuthStateChange;
        }
        var number = `${this.prefix}${
          this.prefix == "+84" ? this.phoneNumber.slice(-9) : this.phoneNumber
        }`;
        console.log(number);
        await this.sleep(1000);
        var result = await sendConfirmationPhoneNumber(
          number,
          onAuthStateChange
        );
        // send code success!!!
        this.$emit("success", result);
      } catch (err) {
        console.error("Phone auth error:", err.code, err.message, err);
        this.showErrorPopup(`${this.$t("error.verifycodefailed")}`);
        this.errored = true;
      }
      this.loading = false;
    },
    async handleAuthStateChange(userObj) {
      if (userObj && userObj.phoneNumber) {
        console.log(">>>>> onAuthStateChanged!! => userObj", userObj);

        var { phoneNumber, uid } = userObj;
        this.loading = true;
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
        this.$emit("successVerification", true);
        this.loading = false;
      }
    },
    reload() {
      window.location.reload();
    },
  },
};
</script>
