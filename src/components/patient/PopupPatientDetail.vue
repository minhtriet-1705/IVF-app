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
          <patient-detail
            ref="PatientDetail"
            v-model="patientId"
            @selectedProfile="selectedProfile"
            @selectedProfileOffline="selectedProfileOffline"
            class="mt-0 pt-0"
          />
          <v-card-title
            class="pt-0 mt-0 text-capitalize"
            v-if="allowPatientList && !patientId"
          >
            {{ $t("common.choose") }} {{ $t("common.contact") }}:
          </v-card-title>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import PatientDetail from "./PatientDetail.vue";
export default {
  props: {
    allowPatientList: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PatientDetail,
  },
  data() {
    return {
      isShow: false,
      resolve: null,
      patientId: null,
    };
  },
  methods: {
    async open(patientId) {
      this.isShow = true;
      this.$refs.PatientDetail.clean();
      this.patientId = patientId || null;
      if (patientId) {
        await this.sleep(50);
        await this.$refs.PatientDetail.viewProfile(patientId);
      }
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    async selectedProfile(profile) {
      this.$emit("selectedProfile", profile);
      this.save();
    },
    async selectedProfileOffline(profile) {
      this.$emit("selectedProfileOffline", profile);
      this.save();
    },
    save() {
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
