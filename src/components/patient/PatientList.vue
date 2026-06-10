<template>
  <div class="content_card patient_list">
    <h5 v-if="!patientOptions.length" class="no_data">
      {{ $t("common.nodata") }}
    </h5>
    <content-item
      v-for="(item, index) in patientOptions"
      :key="index"
      :item="item"
      @view="selectPatient(item.phone)"
      class="contact_item"
    >
      <template v-slot:controller>
        <v-list-item-icon class="pt-1 pb-1 pr-1">
          <v-btn
            small
            class="service_button mr-4"
            fab
            dark
            icon
            elevation="0"
            :disabled="!item.phone || item.phone == $phone"
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
            class="service_button"
            fab
            dark
            icon
            elevation="0"
            :disabled="!item.phone || item.phone == $phone"
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
  </div>
</template>

<script>
import ContentItem from "@/components/cards/ContentItem";
import LottieNewMessage from "@/components/LottieNewMessage.vue";

export default {
  props: {},
  components: {
    ContentItem,
    LottieNewMessage,
  },
  data() {
    return {
      loading: false,
      patientOptions: [],
    };
  },
  async mounted() {
    this.getPatientOptions();
  },
  methods: {
    async getPatientOptions() {
      var result = [];
      this.loading = true;
      var patients = await this.$dbGet(`users/${this.$uid}/patients`);
      this.loading = false;
      if (patients) {
        result = Object.keys(patients).map((key) => ({
          value: key,
          text: patients[key].fullName,
          phone: key,
        }));
        result = result.sort((a, b) => a.text.localeCompare(b.text));
      }
      this.patientOptions = result.map((p) => ({
        ...p,
        image: false,
        title: p.text,
        content: "",
        message: `<span style="color:#e0e0e0;">${p.value || "NA"}</span>`,
        iconbel: true,
      }));
    },
    async selectPatient(phone) {
      var patient = await this.$dbGet(`patients/${phone}`);
      if (!patient) return;
      this.$emit("selectedProfile", patient);
    },
    clean() {},
  },
};
</script>

<style lang="scss">
.patient_list {
  .v-list-item__title {
    color: white;
  }
}
</style>
