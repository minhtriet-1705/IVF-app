<template>
  <div class="content_card mt-5">
    <div class="d-flex mb-3">
      <v-text-field
        v-model="searchText"
        :placeholder="$t('common.search')"
        filled
        outlined
        required
        hide-details
        color="primary"
        @input="search"
        clearable
      ></v-text-field>

      <v-select
        filled
        outlined
        hide-details
        style="width: 120px"
        class="ml-3"
        :items="medicineTypeOptions"
        v-model="medicineType"
        @change="$router.push(`/history?tab=${medicineType}`)"
      ></v-select>
    </div>
    <div style="text-align: center" v-if="loading">
      <v-progress-circular indeterminate class="mt-3"></v-progress-circular>
    </div>
    <div v-else class="pb-10 mb-2">
      <h5 v-if="!items.length" class="no_data mt-5">
        {{ $t("common.nodata") }}
      </h5>
      <div v-for="(item, index) in items" :key="index">
        <!-- <div class="d-flex justify-space-between">
          <h4 class="text-left" style="font-weight: 500">
            <v-icon color="black" class="mr-2"> mdi-clock-outline </v-icon>
            <span v-html="item.loopPatternString" class=""></span>
          </h4>
          <v-switch
            v-model="item.isActive"
            flat
            hide-details
            inset
            style="margin-top: 10px; width: 50px"
            @change="toggleActive(item)"
            v-if="item.userCreatedId == $uid"
          ></v-switch>
          <v-btn
            v-else
            color="dark"
            fab
            small
            dark
            elevation="0"
            style="float: right; margin-top: 5px"
            @click="exitMedicine(item.medicineId)"
            :loading="exitingId == item.medicineId"
            class="mr-1"
          >
            <v-icon small>mdi-logout</v-icon>
          </v-btn>
        </div> -->

        <content-item
          :item="item"
          @view="$router.push(`/medicine/${item.medicineId}`)"
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
                  exitMedicine(item.medicineId);
                "
                :loading="exitingId == item.medicineId"
                v-if="item.userCreatedId != $uid"
              >
                <v-icon dark> mdi-logout </v-icon>
              </v-btn>
            </v-list-item-icon>
          </template>
        </content-item>
      </div>
    </div>
  </div>
</template>

<script>
import { standardizing } from "@/plugins/helpers";
import { RepeatTypeNames } from "@/plugins/constants";
import { unique } from "@/plugins/helpers";
import ContentItem from "@/components/cards/ContentItem";
import moment from "moment";
import axios from "axios";

export default {
  props: {},
  components: {
    ContentItem,
  },
  computed: {
    medicineTypeOptions() {
      return [
        { text: this.$t("common.inProgress"), value: 1 },
        { text: this.$t("common.completed"), value: 2 },
      ];
    },
  },
  watch: {
    "$route.query.tab": {
      deep: true,
      handler: function () {
        this.render();
      },
    },
  },
  data() {
    return {
      loading: true,
      exitingId: null,
      items: [],
      bin: [],
      patientsObj: {},
      medicineType: 1,
      searchText: "",
    };
  },
  async mounted() {
    if (this.$route.query.tab) {
      var tab = parseInt(this.$route.query.tab);
      this.medicineType = tab;
    }
    await this.sleep(500);
    await this.registerWatcher();
    this.render();
  },
  methods: {
    async registerWatcher() {
      this.$dbWatcher(
        `patients/${this.$phone}/medicinesInProgress`,
        async () => {
          this.render();
        }
      );
    },
    async getMedicineDetail(medicineId) {
      if (!medicineId) return null;
      var result = await this.$dbGet(`medicines/${medicineId}`);
      return result || null;
    },
    async getPatientName(phone) {
      if (!phone) return null;
      var result = await this.$dbGet(`patients/${phone}/fullName`);
      return result || null;
    },
    async getPatientAvatar(phone) {
      if (!phone) return null;
      var result = await this.$dbGet(`patients/${phone}/avatar`);
      return result || "icons/user.png";
    },
    async exitMedicine(medicineId) {
      if (!medicineId) return;
      if (!confirm(`${this.$t("common.removeMedicineConfirmMessage")}`)) return;
      this.exitingId = medicineId;
      var resp = await axios.post(
        `https://us-central1-sandrasoft-8fe2b.cloudfunctions.net/ivf_notifyUserCancel`,
        { medicineId, phoneCancelled: this.$phone }
      );
      console.log(resp.data);
      this.exitingId = null;
      this.render();
    },
    async toggleActive(item) {
      var isActive = item.isActive;
      await this.$dbSet(`medicines/${item.medicineId}/isActive`, isActive);
      if (isActive) {
        await this.$dbSet(`medicinesInProgress/${item.medicineId}`, true);
      } else {
        await this.$dbRemove(`medicinesInProgress/${item.medicineId}`);
      }
    },
    async getAllPatientNames(phones = []) {
      phones = unique(phones);
      var promises = [];
      phones.forEach((id) => promises.push(this.getPatientName(id)));
      return new Promise((resolve) => {
        Promise.all(promises)
          .then((values) => {
            for (var ind = 0; ind < phones.length; ind++) {
              if (!this.patientsObj[phones[ind]])
                this.patientsObj[phones[ind]] = {};
              this.patientsObj[phones[ind]].name = values[ind] || "";
            }
            return resolve(this.patientsObj);
          })
          .catch((err) => {
            console.error(err);
            resolve(false);
          });
      });
    },
    async getAllPatientAvatars(phones = []) {
      phones = unique(phones);
      var promises = [];
      phones.forEach((id) => promises.push(this.getPatientAvatar(id)));
      return new Promise((resolve) => {
        Promise.all(promises)
          .then((values) => {
            for (var ind = 0; ind < phones.length; ind++) {
              if (!this.patientsObj[phones[ind]])
                this.patientsObj[phones[ind]] = {};
              this.patientsObj[phones[ind]].avatar = values[ind] || "";
            }
            return resolve(this.patientsObj);
          })
          .catch((err) => {
            console.error(err);
            resolve(false);
          });
      });
    },
    async search() {
      if (!this.searchText) return (this.items = this.bin);
      this.items = this.bin.filter(
        (i) =>
          standardizing(i.message).includes(standardizing(this.searchText)) ||
          standardizing(i.title).includes(standardizing(this.searchText))
      );
    },
    async render() {
      this.loading = true;
      var medicineIdObj = await this.$dbGet(
        `patients/${this.$phone}/${
          this.medicineType == 1 ? "medicinesInProgress" : "medicines"
        }`
      );
      if (!medicineIdObj) {
        this.items = [];
        this.loading = false;
        return;
      }
      var medicineIds = Object.keys(medicineIdObj);
      var promises = [];
      medicineIds.forEach((id) => promises.push(this.getMedicineDetail(id)));
      Promise.all(promises)
        .then(async (values) => {
          values = values
            ? values
                .filter((p) => !!p)
                .sort(
                  (a, b) =>
                    moment(b.dateCreated).valueOf() -
                    moment(a.dateCreated).valueOf()
                )
            : [];
          var phones = [];
          values.forEach((medicine) => {
            var participants = medicine.participants || [];
            var observers = medicine.observers || [];
            phones = [...phones, ...participants, ...observers];
          });

          await this.getAllPatientNames(phones);
          await this.getAllPatientAvatars(phones);

          this.loading = false;
          var items = values.map((p) => {
            p.participants = p.participants || [];
            p.observers = p.observers || [];
            var participantNames = [
              ...p.participants.map((p) => this.patientsObj[p].name),
              ...p.observers.map((p) => this.patientsObj[p].name),
            ];
            var participantsAvatar = [
              ...p.participants.map((p) => this.patientsObj[p].avatar),
              ...p.observers.map((p) => this.patientsObj[p].avatar),
            ];
            if (participantNames.length > 1) {
              participantNames = participantNames.filter(
                (name) => name != this.$fullName
              );
            }
            var loopPatternString = `<p class='mb-1 text-capitalize' style='font-size:90%'>${p.timeSlots
              .map((i) => i.time)
              .join(" - ")} ${this.$t("common.every")}
              ${
                p.loopPatterns
                  ? p.loopPatterns
                      .join("-")
                      .split("D")
                      .join(this.$t("common.day") + " ")
                  : ""
              }
              ${this.$t(`common.${RepeatTypeNames[p.repeatType]}`)}</p>`;
            return {
              ...p,
              loopPatternString,
              image: participantsAvatar[0] || "/icons/user.png",
              imageSize: 62,
              // image: false,
              // title: `<b>${p.medicineName}</b>`,
              title: `<b>${participantNames.join(", ")} - ${moment(
                p.dateCreated
              ).format("DD/MM/YYYY")}</b>`,
              message: `${p.medicineName}`,
              freeContent: `${loopPatternString}`,
              // freeContent: `<span style='font-size:90%'>${participantNames.join(
              //   ", "
              // )}</span>`,
              // message: p.description,
              iconbel: true,
            };
          });
          if (this.medicineType !== 1) {
            items = items.filter((i) => !i.isActive);
          }
          this.items = items;
          this.bin = items;
        })
        .catch((err) => console.error(err));
    },
  },
};
</script>

<style lang="scss"></style>
