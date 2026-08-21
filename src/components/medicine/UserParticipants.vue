<template>
  <div class="text-left">
    <h3 class="mb-3 ml-3 mr-1">
      {{ title }}:
      <v-btn
        color="dark"
        fab
        x-small
        dark
        elevation="0"
        class="header_btn"
        @click="openAddPatient"
        v-if="editable"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </h3>
    <div class="justify-center scroll-x">
      <div style="text-align: center" v-show="loading" class="mt-2">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
      <p class="no_data" v-show="!loading && !items.length">
        {{ $t("common.nodata") }}
      </p>
      <div
        v-show="!loading"
        class="content_card text-center"
        :style="{ width: `${items.length * 268}px` }"
        style="min-width: 100%"
      >
        <content-item
          v-for="(item, index) in items"
          :key="index"
          :item="item"
          @view="viewPatient(item)"
          class="contact_item mr-2"
          style="width: 250px; float: left; height: 80px"
          :style="{ width: item.phone == $phone ? '200px' : '260px' }"
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
                  handleRemoveUser(item);
                "
                v-if="editable"
              >
                <v-icon dark> mdi-trash-can-outline </v-icon>
              </v-btn>
              <v-btn
                small
                class="service_button mr-1"
                fab
                dark
                icon
                elevation="0"
                @click="
                  $event.stopPropagation();
                  $store.commit('Mobile/SET_MESSAGE_PHONE_STRING', item.phone);
                "
                v-if="item.phone != $phone"
              >
                <v-icon>mdi-message-text </v-icon>
                <LottieNewMessage :phone="item.phone" />
              </v-btn>
              <v-btn
                small
                class="service_button mr-1"
                fab
                dark
                icon
                elevation="0"
                @click="
                  $event.stopPropagation();
                  callPhone(item.phone);
                "
                v-if="item.phone != $phone"
              >
                <v-icon>mdi-phone </v-icon>
              </v-btn>
            </v-list-item-icon>
          </template>
        </content-item>
      </div>
    </div>

    <popup-patient-detail
      ref="PopupPatientDetail"
      :allowPatientList="true"
      @selectedProfile="handleAddUser"
    />
  </div>
</template>

<script>
import axios from "axios";
import ContentItem from "@/components/cards/ContentItem";
import PopupPatientDetail from "@/components/patient/PopupPatientDetail";
import LottieNewMessage from "@/components/LottieNewMessage.vue";

export default {
  props: {
    value: {
      type: Array,
    },
    title: {
      type: String,
      default: function () {
        return this.$t("common.contact");
      },
    },
    editable: {
      type: Boolean,
      default: true,
    },
    medicineId: {
      type: String,
      default: "",
    },
  },
  components: {
    ContentItem,
    PopupPatientDetail,
    LottieNewMessage,
  },
  data() {
    return {
      loading: false,
      items: [],
      phones: [],
    };
  },
  watch: {
    value() {
      this.render(this.value);
    },
  },
  mounted() {
    if (this.value) {
      this.render(this.value);
    }
  },
  methods: {
    openAddPatient() {
      this.$refs.PopupPatientDetail.open();
    },

    async getPatient(phone = "") {
      if (!phone) return null;
      phone = this.formatPhoneNumber(phone);
      return (await this.$dbGet(`patients/${phone}`)) || null;
    },
    async render(phones = []) {
      this.phones = phones;
      this.loading = true;
      var promises = [];
      phones.forEach((phone) => promises.push(this.getPatient(phone)));
      Promise.all(promises)
        .then((values) => {
          this.loading = false;
          values = values
            .filter((p) => !!p)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          this.items = values.map((p) => ({
            ...p,
            image: false,
            title: p.fullName,
            content: "",
            message: p.phone,
            iconbel: true,
          }));
        })
        .catch((err) => console.error(err));
    },
    handleAddUser({ phone }) {
      if (!phone) return;
      var ind = this.phones.findIndex((p) => p == phone);
      if (ind != -1) return;
      this.phones.push(phone);
      this.render(this.phones);
    },
    async handleRemoveUser({ phone }) {
      if (!phone) return;
      var ind = this.phones.findIndex((p) => p == phone);
      if (ind != -1) {
        if (this.medicineId) {
          if (!confirm(`${this.$t("common.removeMedicineConfirmMessage")}`))
            return;
          await this.notifyCancelUser(phone);
        }
        this.phones.splice(ind, 1);
        this.render(this.phones);
      }
    },
    async notifyCancelUser(phone) {
      if (!this.medicineId || !phone) return;
      phone = this.formatPhoneNumber(phone);
      var resp = await axios.post(
        `https://us-central1-ivf-app-new.cloudfunctions.net/ivf_notifyCancelUser`,
        // `http://localhost:5001/sandrasoft-8fe2b/us-central1/ivf_notifyCancelUser`,
        { medicineId: this.medicineId, phoneCancelled: phone }
      );
      console.log(resp.data);
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
