<template>
  <div class="content_card mt-5">
    <div class="d-flex w-100">
      <v-text-field
        :placeholder="$t('common.search')"
        v-model="searchText"
        clearable
        filled
        outlined
        required
        hide-details
        color="primary"
        @input="search"
        v-if="!showSelectedDoctorOnly"
      >
      </v-text-field>
      <v-btn
        class="text-capitalize btn_show_scanner"
        elevation="0"
        style="height: 55px !important; width: 100px !important"
        dark
        v-if="isAdmin"
        @click="$refs.PopupPatientDetail.open()"
      >
        <v-icon small class="mr-2">mdi-plus</v-icon>
        {{ $t("common.add") }}
      </v-btn>
    </div>
    <div style="text-align: center" v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div v-else class="mb-2">
      <div v-for="(item, index) in items" :key="index">
        <content-item
          :item="item"
          @view="viewProfile(item.phone)"
          class="contact_item"
        >
          <template v-slot:controller>
            <v-list-item-icon class="pt-1 pb-1 pr-1">
              <v-btn
                x-small
                fab
                dark
                icon
                @click="
                  $event.stopPropagation();
                  deleteDoctor(item.phone);
                "
                v-if="isAdmin"
              >
                <v-icon dark> mdi-trash-can-outline </v-icon>
              </v-btn>
              <v-btn
                @click="
                  $event.stopPropagation();
                  handleSelectDoctor(item);
                "
                fab
                dark
                icon
                elevation="0"
                color="black"
                style="background-color: #e0e0e0 !important; width: 42px"
                v-if="enableSelect"
              >
                <v-icon v-if="selectedDoctorPhone == item.phone"
                  >mdi-check
                </v-icon>
              </v-btn>
            </v-list-item-icon>
          </template>
        </content-item>
      </div>
      <h5 class="no_data" v-if="!items.length">
        {{ $t("common.nodata") }}
      </h5>
    </div>
    <popup-patient-detail
      ref="PopupPatientDetail"
      @selectedProfile="addToDoctorList"
    />
  </div>
</template>

<script>
import ContentItem from "@/components/cards/ContentItem";
import PopupPatientDetail from "@/components/patient/PopupPatientDetail";
import { standardizing } from "@/plugins/helpers";

export default {
  props: {
    value: {
      type: String,
      default: function () {
        return "";
      },
    },
    enablePopup: {
      type: Boolean,
      default: true,
    },
    enableSelect: {
      type: Boolean,
      default: true,
    },
    showSelectedDoctorOnly: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ContentItem,
    PopupPatientDetail,
  },
  watch: {
    value() {
      this.selectedDoctorPhone = this.value;
      if (this.showSelectedDoctorOnly) {
        this.items = this.bin.filter(
          (i) => i.phone == this.selectedDoctorPhone
        );
      }
    },
  },
  data() {
    return {
      bin: [],
      loading: false,
      visible: true,
      items: [],
      selectedDoctorPhone: null,
      searchText: "",
    };
  },
  async mounted() {
    // this.createDoctor();
    this.loading = true;
    await this.render();
    this.loading = false;
  },
  methods: {
    async search() {
      if (!this.searchText) return (this.items = this.bin);
      this.items = this.bin.filter(
        (i) =>
          standardizing(i.fullName).includes(standardizing(this.searchText)) ||
          standardizing(i.phone).includes(standardizing(this.searchText))
      );
    },
    async deleteDoctor(phone = "") {
      if (!phone || phone == "---") return;
      if (!confirm(`${this.$t("common.confirmDeleteContact")}`)) return;
      await this.$dbRemove(`doctors/${phone}`);
      this.showSuccess(this.$t("common.successMessage"));
      this.render();
    },
    async handleSelectDoctor(item = {}) {
      if (this.enableSelect) {
        var { phone } = item;
        this.selectedDoctorPhone = phone;
        this.$emit("input", phone);
        this.$emit("data", item);
      }
    },
    async viewProfile(phone) {
      if (this.enablePopup) {
        this.$refs.PopupPatientDetail.open(phone);
      }
    },
    async addToDoctorList({ phone }) {
      if (!phone) return;
      await this.$dbSet(`doctors/${phone}`, true);
      this.render();
    },
    async createDoctor() {
      await this.$dbSet(`doctors`, {
        "0914118896": true,
        "0222222222": true,
      });
    },
    async getPatientDetail(phoneString) {
      // var id = await this.$dbGet(`patients/${phoneString}/id`);
      // if (!id) return null;
      // return await this.$dbGet(`users/${id}`);
      return {
        avatar: await this.$dbGet(`patients/${phoneString}/avatar`),
        fullName: await this.$dbGet(`patients/${phoneString}/fullName`),
        phone: phoneString,
      };
    },
    async render() {
      var profiles = [];
      var doctorPhones = (await this.$dbGet(`doctors`)) || {};
      doctorPhones = Object.keys(doctorPhones);
      doctorPhones.forEach((phone) =>
        profiles.push(this.getPatientDetail(phone))
      );
      return new Promise((resolve) => {
        Promise.all(profiles).then((items) => {
          this.items = items.map((p) => ({
            ...p,
            image: p.avatar || "/icons/user.png",
            imageSize: 62,
            title: p.fullName,
            content: this.formatPhoneNumber(p.phone),
            phone: this.formatPhoneNumber(p.phone),
            fullName: p.fullName,
          }));
          this.bin = JSON.parse(JSON.stringify(this.items));

          this.selectedDoctorPhone =
            this.selectedDoctorPhone || (this.items[0] && this.items[0].phone);
          this.$emit("input", this.selectedDoctorPhone);
          this.$emit(
            "data",
            this.items.find((p) => p.phone == this.selectedDoctorPhone)
          );

          return resolve(this.items);
        });
      });
    },
    clean() {},
  },
};
</script>
