<template>
  <div>
    <h5 v-if="!editable && !patientId" class="no_data">
      {{ $t("common.nodata") }}
    </h5>

    <div class="table profile" v-if="patientId">
      <p>
        {{ $t("user.fullName") }}:
        <b class="mr-4">{{ data.fullName }}</b>
      </p>
      <p>
        {{ $t("user.phone") }}:
        <b class="mr-4">{{ data.phone }}</b>
        {{ $t("user.gender") }}:
        <b class="mr-4"><gender-type :gender="data.gender" /></b>
      </p>
      <p>
        {{ $t("user.dob") }}:
        <b class="mr-4">{{ data.birthdate || $t("common.nodata") }}</b>
        {{ $t("user.identityId") }}:
        <b class="mr-4">{{ data.identityId || $t("common.nodata") }}</b>
      </p>
      <p>
        {{ $t("user.address") }}:
        <b class="mr-4">{{ data.address || $t("common.nodata") }}</b>
      </p>
    </div>

    <div class="text-center" v-if="editable">
      <v-btn
        class="mt-5 custom pa-6 pl-8 pr-8 mb-1"
        :loading="loading"
        @click="choosePatient"
      >
        <v-icon class="mr-1" small>mdi-plus</v-icon>
        {{ $t("common.choose") }} {{ $t("common.patient") }}
      </v-btn>
    </div>

    <popup-patient-detail
      ref="PopupPatientDetail"
      :allowPatientList="allowPatientList"
      @selectedProfile="selectedProfile"
      @selectedProfileOffline="selectedProfileOffline"
    />
  </div>
</template>

<script>
import GenderType from "../GenderType.vue";
import PopupPatientDetail from "./PopupPatientDetail.vue";
export default {
  components: { PopupPatientDetail, GenderType },
  props: {
    value: {
      type: String,
      default: null,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    allowPatientList: {
      type: Boolean,
      default: false,
    },
  },
  computed: {},
  data() {
    return {
      patientId: null,
      loading: false,
      data: {},
    };
  },
  mounted() {
    if (this.networkStatus) {
      this.renderProfile(this.value);
    }
  },
  methods: {
    async renderProfile(patientId = "") {
      if (!patientId) return {};
      this.loading = true;
      var patient = await this.$dbGet(`patients/${patientId}`);
      this.loading = false;
      if (!patient) return {};
      this.data = patient;
      this.patientId = patientId;
      return patient;
    },
    async selectedProfile(profile = {}) {
      this.data = profile;
      var patientId = this.formatPhoneNumber(this.data.phone);
      this.$emit("input", patientId);
      this.$emit("selectedProfile", profile);
      this.patientId = patientId;
    },
    async selectedProfileOffline(profile = {}) {
      this.data = profile;
      var patientId = this.formatPhoneNumber(this.data.phone);
      this.$emit("input", patientId);
      this.$emit("selectedProfileOffline", profile);
      this.patientId = patientId;
    },
    renderOfflinePatient(patientObject) {
      this.patientId = patientObject.patientId || patientObject.phone;
      this.data = patientObject;
    },
    choosePatient() {
      this.$refs.PopupPatientDetail.open(this.patientId);
    },
    clean() {
      this.patientId = null;
      this.loading = false;
      this.data = {};
    },
  },
};
</script>
