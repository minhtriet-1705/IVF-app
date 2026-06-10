<template>
  <v-container>
    <v-row>
      <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
        <v-avatar size="102px" style="border-radius: 0px">
          <img alt="Avatar" :src="data.avatar || '/icons/user.png'" />
        </v-avatar>
        <div v-if="isAdmin" class="w-100 mt-1" style="text-align: center">
          <choose-file v-model="data.avatar" />
        </div>
        <h2 class="text-center mb-2 mt-5">{{ data.fullName }}</h2>
      </v-col>
      <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
        <div style="width: 100%; display: flex">
          <v-text-field
            v-model="data.phone"
            clearable
            type="number"
            :label="$t('user.phone') + ' *'"
            filled
            outlined
            required
            hide-details
            v-mask="'##########'"
            color="primary"
            :disabled="isViewMode"
          ></v-text-field>
          <v-btn
            class="text-capitalize btn_show_scanner"
            @click="callPhone(data.phone)"
            elevation="0"
            style="height: 55px !important; width: 100px !important"
            dark
            v-if="isViewMode"
          >
            <v-icon small class="mr-2">mdi-phone</v-icon>
            {{ $t("common.call") }}
          </v-btn>
          <v-btn
            class="text-capitalize btn_show_scanner"
            @click="showScanner = true"
            elevation="0"
            style="height: 55px !important"
            v-if="!isViewMode"
            dark
            fab
          >
            <v-icon small>mdi-line-scan</v-icon>
          </v-btn>
        </div>
        <v-btn
          type="submit"
          block
          class="text-uppercase mb-5"
          :loading="loading"
          @click="checkProfile"
          v-show="data.phone"
          v-if="!isViewMode"
          dark
          style="margin-top: -6px"
        >
          <v-icon class="mr-3" small>mdi-magnify</v-icon>
          {{ $t("common.search") }} {{ $t("user.phone") }}
        </v-btn>
        <div
          v-show="data.phone && showSearchResult"
          style="width: 100%; float: left"
        >
          <v-text-field
            v-model="data.fullName"
            :label="$t('user.fullName') + ' *'"
            filled
            outlined
            required
            hide-details
            :disabled="!editable"
            color="primary"
          ></v-text-field>
          <v-row>
            <v-col>
              <v-select
                v-model="data.gender"
                :label="$t('user.gender') + ' *'"
                filled
                outlined
                color="primary"
                required
                :items="genderOptions"
                hide-details
                :disabled="!editable"
              ></v-select>
            </v-col>
            <v-col>
              <v-text-field
                v-model="data.birthdate"
                :label="$t('user.dob')"
                filled
                outlined
                hide-details
                v-mask="'##/##/####'"
                :disabled="!editable"
                color="primary"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-text-field
            v-model="data.identityId"
            :label="$t('user.identityId')"
            filled
            outlined
            hide-details
            :disabled="!editable"
            color="primary"
          ></v-text-field>
          <v-text-field
            v-model="data.address"
            :label="$t('user.address')"
            filled
            outlined
            hide-details
            :disabled="!editable"
            color="primary"
          ></v-text-field>

          <text-editor
            v-model="data.description"
            class="mb-4"
            :placeholder="$t('common.description')"
            :editable="editable"
          />
        </div>
        <v-btn
          type="submit"
          block
          class="btn_login mb-5 text-uppercase"
          :loading="loading"
          v-if="data.fullName && data.phone && data.gender && isCheckBtnClicked"
          style="margin-top: 15px"
          @click="updateProfile"
          dark
        >
          <v-icon class="mr-3" small>mdi-check</v-icon>
          {{ $t("common.confirmed") }}
        </v-btn>
      </v-col>
    </v-row>
    <qrcode-stream v-if="showScanner" @decode="onDecode"></qrcode-stream>
    <v-btn
      fixed
      @click="showScanner = false"
      v-if="showScanner"
      fab
      dark
      class="btn_close_scanner"
      style="border-radius: 50px"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { GenderType } from "@/plugins/constants";
import { QrcodeStream } from "vue-qrcode-reader";
import TextEditor from "@/components/ckeditor/TextEditor.vue";
import ChooseFile from "@/components/ChooseFile.vue";

var defaultPatientProfile = () => ({
  fullName: "",
  identityId: "",
  gender: GenderType.Male,
  phone: "",
  address: "",
  birthdate: "",
  description: "",
});

export default {
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  components: {
    QrcodeStream,
    TextEditor,
    ChooseFile,
  },
  computed: {
    genderOptions() {
      return Object.keys(GenderType).map((key) => ({
        text: this.$t(`register.${key.toLowerCase()}`),
        value: GenderType[key],
      }));
    },
  },
  watch: {
    value(val) {
      this.renderProfile(val);
    },
  },
  data() {
    return {
      isCheckBtnClicked: false,
      isViewMode: false,
      showSearchResult: false,
      showScanner: false,
      loading: false,
      data: defaultPatientProfile(),
      editable: true,
    };
  },
  methods: {
    async updateProfile() {
      var patientId = this.formatPhoneNumber(this.data.phone);
      if (this.isAdmin) {
        console.log("Update profile patient by admin");
        this.data.patientId = patientId;
        this.loading = true;
        await this.$dbSet(`patients/${patientId}`, this.data);
        // add to contact list component
        // await this.$dbSet(`users/${this.$uid}/patients/${patientId}`, {
        //   fullName: this.data.fullName,
        // });
        // if (this.data.id) {
        //   await this.$dbSet(`users/${this.data.id}/patients/${this.$phone}`, {
        //     fullName: this.$fullName,
        //   });
        // }
      }
      this.$emit("input", patientId);
      this.$emit("selectedProfile", this.data);
      this.loading = false;
    },
    async checkProfile() {
      this.isCheckBtnClicked = true;
      var patientId = this.formatPhoneNumber(this.data.phone);
      this.data.patientId = patientId;
      if (!patientId) return;
      this.showSearchResult = true;
      if (this.networkStatus) {
        console.log("Checking profile " + patientId + "...");
        var result = await this.renderProfile(patientId);
        console.log("Found:", result || null);
        if (!result) this.data = { ...defaultPatientProfile, phone: patientId };
      } else {
        this.data = { ...defaultPatientProfile, phone: patientId };
      }
    },
    async renderProfile(patientId = "") {
      if (!patientId) return false;
      this.loading = true;
      var patient = await this.$dbGet(`patients/${patientId}`);
      this.loading = false;
      if (!patient) {
        this.editable = true;
        return false;
      }
      this.data = patient;
      this.editable = false;
      return patient;
    },
    async viewProfile(patientId = "") {
      this.isCheckBtnClicked = true;
      this.isViewMode = true;
      this.showSearchResult = true;
      this.renderProfile(patientId);
    },
    async onDecode(str) {
      if (str) {
        var phone = str.split("?PHONE=")[1];
        if (phone) {
          this.data.phone = phone;
          this.checkProfile();
        }
      }
      this.showScanner = false;
    },
    clean() {
      this.isCheckBtnClicked = false;
      this.isViewMode = false;
      this.showSearchResult = false;
      this.showScanner = false;
      this.loading = false;
      this.editable = true;
      this.data = defaultPatientProfile();
    },
  },
};
</script>

<style lang="scss"></style>
