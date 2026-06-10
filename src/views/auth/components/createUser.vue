<template>
  <div>
    <v-form v-model="valid" @submit.prevent="createUser">
      <label class="label_title text-capitalize">{{
        $t("register.registeraccount")
      }}</label>
      <v-text-field
        v-model="fullName"
        :label="$t('user.fullName')"
        filled
        outlined
        color="primary"
        required
        :rules="nameRules"
        @change="$store.commit('Authen/SET_FULLNAME', fullName)"
        hide-details
      ></v-text-field>
      <v-select
        v-model="gender"
        :label="$t('user.gender')"
        filled
        outlined
        color="primary"
        required
        :items="genderOptions"
        @change="$store.commit('Authen/SET_GENDER', gender)"
        hide-details
      ></v-select>
      <v-text-field
        v-model="birthDate"
        :label="$t('user.dob')"
        filled
        outlined
        color="primary"
        required
        :rules="dateRules"
        v-mask="'##/##/####'"
        placeholder="DD/MM/YYYY (e.g. 01/01/2002)"
        @change="$store.commit('Authen/SET_BIRTHDATE', birthDate)"
        hide-details
      ></v-text-field>
      <v-text-field
        v-model="profileID"
        :label="$t('user.profileID')"
        filled
        outlined
        color="primary"
        required
        @change="$store.commit('Authen/SET_PROFILEID', profileID)"
        hide-details
      ></v-text-field>
      <label class="label_title text-capitalize pt-2">
        {{ $t("common.choose") }} {{ $t("common.doctorInCharge") }}
      </label>
      <patient-doctor @data="handleDoctorSelected" :enablePopup="false" />
      <v-btn
        type="submit"
        color="primary"
        block
        class="btn_login mb-5 text-uppercase"
        :loading="loading"
        :disabled="!valid"
        style="margin-top: 15px"
      >
        {{ $t("register.continue") }}
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import { GenderType } from "@/plugins/constants";
import PatientDoctor from "@/components/patient/PatientDoctor.vue";
import moment from "moment";

export default {
  components: { PatientDoctor },
  computed: {
    genderOptions() {
      return Object.keys(GenderType).map((key) => ({
        text: this.$t(`register.${key.toLowerCase()}`),
        value: GenderType[key],
      }));
    },
  },
  data() {
    return {
      loading: false,
      valid: false,
      fullName: this.$store.getters["Authen/getUser"].fullName,
      gender: this.$store.getters["Authen/getUser"].gender,
      birthDate: this.$store.getters["Authen/getUser"].birthDate,
      profileID: this.$store.getters["Authen/getUser"].profileID,
      doctorInCharge: {
        phone: "",
        fullName: "",
      },
      nameRules: [
        (v) => !!v || "Name is required",
        (v) =>
          (!!v && v.length >= 6) || "Name must be bigger than 6 characters",
      ],
      dateRules: [
        (v) => !!v || "Date is require",
        (v) => {
          const date = moment(v, "DD/MM/YYYY", true);
          return date.isValid() || "Invalid date";
        },
      ],
    };
  },
  mounted() {},
  methods: {
    handleDoctorSelected(data = {}) {
      this.doctorInCharge = data;
    },
    async createUser() {
      try {
        this.loading = true;
        // Save user data in store
        this.$store.commit("Authen/SET_FULLNAME", this.fullName);
        this.$store.commit("Authen/SET_GENDER", this.gender);
        this.$store.commit("Authen/SET_BIRTHDATE", this.birthDate);
        this.$store.commit("Authen/SET_PROFILEID", this.profileID);
        this.$store.commit("Authen/SET_DOCTOR_IN_CHARGE", this.doctorInCharge);
        // Navigate to the term page
        this.$router.push({ name: "term" });
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
