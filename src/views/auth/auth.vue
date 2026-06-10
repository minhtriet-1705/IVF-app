<template>
  <backdrop-blur>
    <v-row class="signup" justify="center" align="center">
      <v-col class="main_container" style="max-width: 664px">
        <v-container fill-height class="pa-1">
          <v-row>
            <v-col
              cols="12"
              justify="center"
              align="center"
              v-show="step < 3"
              style="margin-top: -25%"
            >
              <lottie-loader :url="'/lottie/baby.json'" :width="'80%'" />
              <h1 class="page_title text-center" style="margin-top: -15%">
                myIVF
              </h1>
            </v-col>
            <v-col
              cols="12"
              justify="center"
              align="center"
              class="pl-7 pr-7 pt-0 ma-0"
            >
              <send-code
                v-show="step == 1"
                @success="step = 2"
                @successVerification="step = 3"
              />
              <verify-phone v-show="step == 2" @success="step = 3" />
              <create-user v-show="step == 3" />
              <term-condition
                v-show="step == 4"
                @confirmed="step = 4"
                :editable="false"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </backdrop-blur>
</template>

<script>
import SendCode from "./components/sendCode.vue";
import VerifyPhone from "./components/verifyPhone.vue";
import CreateUser from "./components/createUser.vue";
import BackdropBlur from "@/components/BackdropBlur.vue";
import LottieLoader from "@/components/LottieLoader.vue";
import TermCondition from "@/components/TermCondition.vue";

export default {
  components: {
    SendCode,
    VerifyPhone,
    CreateUser,
    BackdropBlur,
    LottieLoader,
    TermCondition,
  },
  data() {
    return {
      loading: false,
      step: 1,
    };
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss">
@import "./auth.scss";
</style>
