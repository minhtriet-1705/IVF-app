<template>
  <v-container class="pa-0 ma-0">
    <h3 class="mb-3">
      <v-icon color="black" class="title_icon">
        mdi-card-account-phone-outline
      </v-icon>
      {{ $t("common.contact") }}:
      <v-btn
        color="dark"
        fab
        x-small
        dark
        elevation="0"
        style="float: right"
        @click="openAddPatient"
        v-if="isAdmin"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        fab
        x-small
        elevation="0"
        style="float: right"
        @click="getPatientOptions"
        icon
      >
        <v-icon style="font-size: 1.6rem" color="#212121">mdi-refresh</v-icon>
      </v-btn>
    </h3>
    <div style="text-align: center" v-if="loading" class="mb-5">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div class="content_card text-center">
      <v-row
        v-show="!patientOptions.length && !loading"
        justify="center"
        align="center"
        class="pa-5 pl-2 pr-2"
        style="height: auto"
      >
        <lottie-loader :url="'/lottie/find-doctor.json'" :width="'270px'" />
      </v-row>
      <content-item
        v-show="!loading"
        v-for="(item, index) in patientOptions"
        :key="index"
        :item="item"
        @view="viewPatient(item)"
        class="contact_item"
      >
        <template v-slot:controller>
          <v-list-item-icon class="pt-1 pb-1 pr-1">
            <v-btn
              x-small
              fab
              dark
              icon
              class="delete_btn"
              @click="
                $event.stopPropagation();
                deletePhoneContact(item.phone);
              "
            >
              <v-icon dark> mdi-trash-can-outline </v-icon>
            </v-btn>
            <v-btn
              small
              class="service_button mr-4"
              fab
              dark
              icon
              elevation="0"
              @click="
                $event.stopPropagation();
                $store.commit('Mobile/SET_MESSAGE_PHONE_STRING', item.value);
              "
            >
              <v-icon>mdi-message-text </v-icon>
              <LottieNewMessage :phone="item.phone" />
            </v-btn>
            <v-btn
              small
              class="service_button mr-2"
              fab
              dark
              icon
              elevation="0"
              @click="
                $event.stopPropagation();
                callPhone(item.value);
              "
            >
              <v-icon>mdi-phone </v-icon>
            </v-btn>
          </v-list-item-icon>
        </template>
      </content-item>

      <v-btn
        @click="openAddPatient"
        dark
        color="dark"
        rounded
        class="mt-1 pa-5"
        small
        v-if="isAdmin"
      >
        <v-icon left> mdi-plus </v-icon>
        {{ $t("common.add") }}
        {{ $t("common.contact") }}
      </v-btn>
    </div>

    <popup-patient-detail
      ref="PopupPatientDetail"
      @selectedProfile="getPatientOptions"
    />
  </v-container>
</template>

<script>
import ContentItem from "@/components/cards/ContentItem";
import PopupPatientDetail from "@/components/patient/PopupPatientDetail";
import LottieNewMessage from "@/components/LottieNewMessage.vue";
import LottieLoader from "@/components/LottieLoader.vue";

export default {
  components: {
    ContentItem,
    PopupPatientDetail,
    LottieNewMessage,
    LottieLoader,
  },
  data() {
    return {
      loading: true,
      items: [],
      patientOptions: [],
    };
  },
  async mounted() {
    await this.sleep(500);
    this.getPatientOptions();
    this.$store.commit("Scanner/SET_IS_MEASURING", false);
  },
  methods: {
    openAddPatient() {
      this.$refs.PopupPatientDetail.open();
    },
    async deletePhoneContact(phone) {
      if (!phone || phone == "---") return;
      if (!confirm(`${this.$t("common.confirmDeleteContact")}`)) return;
      await this.$dbRemove(`users/${this.$uid}/patients/${phone}`);
      this.playNof();
      this.showSuccess(this.$t("common.successMessage"));
      this.getPatientOptions();
    },
    async getPatientOptions() {
      var result = [];
      this.loading = true;
      var patients = await this.$dbGet(`users/${this.$uid}/patients`);
      if (patients) {
        result = Object.keys(patients).map((key) => ({
          value: key,
          text: patients[key].fullName,
          phone: key,
        }));
        result = result
          .filter((p) => p.phone != this.$phone)
          .sort((a, b) => a.text.localeCompare(b.text));
      }
      this.patientOptions = result.map((p) => ({
        ...p,
        image: false,
        title: p.text,
        content: "",
        message: `<span style="color:#e0e0e0;">${p.value || "NA"}</span>`,
        iconbel: true,
      }));
      this.loading = false;
    },
    viewPatient(item) {
      this.$refs.PopupPatientDetail.open(item.phone);
    },
  },
};
</script>

<style lang="scss">
.delete_btn {
  position: absolute;
  top: -1px;
  right: -1px;
}
</style>
