<template>
  <v-container class="setting pl-1 pr-0">
    <v-row>
      <v-col cols="12" justify="center" align="center" class="mt-5">
        <v-avatar size="96px" style="border-radius: 0px">
          <img alt="Avatar" :src="profile.avatar || '/icons/user.png'" />
        </v-avatar>
        <div class="w-100 mt-1" style="text-align: center">
          <choose-file v-model="profile.avatar" />
        </div>
        <h2 class="text-center mb-1 mt-3">{{ profile.fullName }}</h2>
      </v-col>
      <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
        <v-form v-model="valid" @submit.prevent="updateProfile">
          <v-text-field
            v-model="profile.fullName"
            :label="$t('user.fullName')"
            filled
            outlined
            required
            :rules="nameRules"
            hide-details
            color="primary"
            :disabled="true"
          ></v-text-field>
          <v-row>
            <v-col>
              <v-select
                v-model="profile.gender"
                :label="$t('user.gender')"
                filled
                outlined
                required
                :items="genderOptions"
                hide-details
                color="primary"
                :disabled="true"
              ></v-select>
            </v-col>
            <v-col>
              <v-text-field
                v-model="patient.birthdate"
                :label="$t('user.dob')"
                filled
                outlined
                hide-details
                v-mask="'##/##/####'"
                color="primary"
                :disabled="true"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            v-model="patient.identityId"
            :label="$t('user.identityId')"
            filled
            outlined
            color="primary"
            hide-details
            :disabled="true"
          ></v-text-field>
          <v-text-field
            v-model="patient.address"
            :label="$t('user.address')"
            filled
            outlined
            color="primary"
            hide-details
            :disabled="true"
          ></v-text-field>
          <v-text-field
            v-model="profile.profileID"
            :label="$t('user.profileID')"
            filled
            outlined
            color="primary"
            hide-details
            :disabled="true"
          ></v-text-field>

          <h3 class="text-center mt-2">{{ $t("common.doctorInCharge") }}</h3>
          <patient-doctor
            v-model="patient.doctorInCharge"
            :showSelectedDoctorOnly="true"
          />
          <!-- <text-editor
            v-model="patient.description"
            class="mb-4"
            :placeholder="$t('common.description')"
          /> -->
          <v-select
            v-model="language"
            :label="$t('common.chooseLanguage')"
            filled
            outlined
            required
            hide-details
            :items="languageOptions"
            @change="onChangeLanguage"
          ></v-select>
          <v-btn
            type="submit"
            block
            class="btn_login mt-4 mb-2 text-uppercase"
            :loading="loading"
            :disabled="!valid"
            style="margin-top: 15px"
            color="primary"
          >
            {{ $t("common.save") }}
          </v-btn>
          <v-btn
            dark
            block
            class="mb-5 text-uppercase"
            style="margin-top: 15px"
            @click="$refs.PopupPersonalQr.confirm()"
          >
            {{ $t("common.showQr") }}
          </v-btn>
          <v-btn
            color="red"
            block
            class="btn_login mt-5 mb-2 text-uppercase white--text"
            style="margin-top: 15px; background-color: #ef5350 !important"
            @click="logout"
          >
            {{ $t("user.logout") }}
          </v-btn>
        </v-form>

        <span style="font-size: 80%">App version 1.3.2</span>
      </v-col>
    </v-row>
    <popup-personal-qr ref="PopupPersonalQr" />
  </v-container>
</template>

<script>
import { GenderType } from "@/plugins/constants";
import ChooseFile from "@/components/ChooseFile.vue";
import PopupPersonalQr from "@/components/PopupPersonalQr.vue";
import { getAppLanguage } from "@/lang/i18n";
import axios from "axios";
import PatientDoctor from "@/components/patient/PatientDoctor.vue";
// import TextEditor from "@/components/ckeditor/TextEditor.vue";

import { getLocalStorage, removeLocalStorage } from "@/plugins/helpers";
import { cfaSignOut } from "capacitor-firebase-auth";

export default {
  components: {
    ChooseFile,
    PopupPersonalQr,
    PatientDoctor,
    // TextEditor,
  },
  computed: {
    genderOptions() {
      return Object.keys(GenderType).map((key) => ({
        text: this.$t(`register.${key.toLowerCase()}`),
        value: GenderType[key],
      }));
    },
    languageOptions() {
      return [
        { text: "English", value: "en" },
        { text: "Việt Nam", value: "vn" },
      ];
    },
  },
  data() {
    return {
      loading: false,
      valid: false,
      id: this.$store.getters["Authen/getUser"].id,
      profile: {
        fullName: this.$store.getters["Authen/getUser"].fullName,
        avatar: this.$store.getters["Authen/getUser"].avatar,
        gender: this.$store.getters["Authen/getUser"].gender,
        profileID: this.$store.getters["Authen/getUser"].profileID,
      },
      patient: {
        address: "",
        birthdate: "",
        identityId: "",
        doctorInCharge: "",
      },
      language: getAppLanguage(),
      nameRules: [
        (v) => !!v || "Name is required",
        (v) =>
          (!!v && v.length >= 6) || "Name must be bigger than 6 characters",
      ],
      isSyncing: false,
      syncPercent: 0,
      done: 0,
      totals: 0,
    };
  },
  mounted() {
    this.getProfile();
    this.listeningSyncingEvent();
  },
  methods: {
    async logout() {
      var deviceToken = getLocalStorage("FcmDeviceToken");
      if (deviceToken) {
        await this.$dbRemove(`deviceToken/${this.$uid}/${deviceToken}`);
        removeLocalStorage("FcmDeviceToken");
      }
      cfaSignOut().subscribe();
      this.$store.commit("Authen/LOGOUT");
      await this.sleep(200);
      this.$router.go("/login");
    },
    async getProfile() {
      if (!this.id) return;
      if (!this.$phone) return;
      this.profile = {
        fullName: await this.$dbGet(`users/${this.id}/fullName`),
        gender: await this.$dbGet(`users/${this.id}/gender`),
        avatar: await this.$dbGet(`users/${this.id}/avatar`),
        profileID: await this.$dbGet(`users/${this.id}/profileID`),
      };
      var patient = await this.$dbGet(`patients/${this.$phone}`);
      this.patient = { ...patient, ...this.profile };
    },
    async updateProfile() {
      if (!this.id) return;
      this.loading = true;

      await this.$dbSet(`users/${this.id}/fullName`, this.profile.fullName);
      await this.$dbSet(`users/${this.id}/gender`, this.profile.gender);
      await this.$dbSet(`users/${this.id}/avatar`, this.profile.avatar);
      await this.$dbSet(`users/${this.id}/profileID`, this.profile.profileID);

      await this.$dbSet(`patients/${this.$phone}`, this.patient);

      var user = this.$store.getters["Authen/getUser"];
      user = { ...user, ...this.profile };
      this.$store.commit("Authen/SET_USER_PROFILE", user);
      await this.sleep(200);
      await this.ensurePatientProfileExist();
      this.loading = false;
      this.showSuccess(this.$t("common.successMessage"));
    },
    async onChangeLanguage() {
      var language = this.language;
      this.$root.$i18n.locale = language;
      localStorage.setItem("BLE_APP_DEFAULT_LANGUAGE", language);
    },
    async syncDataFromServer() {
      this.isSyncing = true;
      var result = await axios.post(
        "https://us-central1-sandrasoft-8fe2b.cloudfunctions.net/syncDatapointsFromServer",
        {},
        { headers: { phone: this.$phone, uid: this.$uid } }
      );
      if (!result || !result.totals) this.isSyncing = false;
    },
    listeningSyncingEvent() {
      this.$dbWatcher(`syncing/${this.$uid}`, async (obj) => {
        if (!obj) {
          this.syncPercent = 0;
          this.isSyncing = false;
          this.done = 0;
          this.totals = 0;
          return;
        }
        this.isSyncing = true;
        var { done, totals } = obj;
        this.syncPercent = Math.floor((done / totals) * 100);
        this.done = done;
        this.totals = totals;
      });
    },
  },
};
</script>

<style lang="scss"></style>
