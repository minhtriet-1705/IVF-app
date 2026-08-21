<template>
  <v-container class="setting medicine_detail pl-1 pr-0">
    <v-row>
      <v-col
        cols="12"
        justify="center"
        align="center"
        class="mt-5"
        style="position: relative"
      >
        <choose-file
          v-model="data.avatar"
          class="ml-1 cusomized choosefile"
          v-if="editable"
        />
        <v-avatar size="76px">
          <img alt="Avatar" :src="data.avatar || '/medicine/injection.png'" />
        </v-avatar>
        <div class="d-flex justify-center mt-5">
          <choose-icon v-model="data.avatar" v-if="editable" />
        </div>
        <h2 class="text-center mb-1 mt-3">
          {{ data.medicineName || $t("common.drugName") }}
        </h2>
      </v-col>
      <v-col cols="12" justify="center" align="center" class="pl-3 pr-3">
        <v-form @submit.prevent="save">
          <v-text-field
            v-model="data.medicineName"
            :label="$t('common.drugName')"
            filled
            outlined
            required
            hide-details
            :disabled="!editable"
          ></v-text-field>
          <v-textarea
            v-model="data.description"
            :label="$t('medicine.description')"
            filled
            outlined
            hide-details
            :disabled="!editable"
            :rows="4"
          ></v-textarea>
          <h3 class="text-left pl-1 mb-2">{{ $t("common.time") }}:</h3>
          <div
            class="d-flex pl-3 pr-1"
            v-for="(slot, ind) in data.timeSlots"
            :key="ind"
          >
            <h3 class="title_text">{{ $t("common.dose") }} {{ ind + 1 }}:</h3>
            <v-spacer></v-spacer>
            <div class="countdown" @click="handleTimeClicked(ind)">
              <div class="countdown__block">
                <div class="countdown__digit">
                  {{ slot.time | formatHour }}
                </div>
                <div class="countdown__text">Hrs</div>
              </div>
              <div class="countdown__block">
                <div class="countdown__digit">
                  {{ slot.time | formatMinute }}
                </div>
                <div class="countdown__text">Min</div>
              </div>
            </div>
            <v-btn
              @click="removeTimeSlot(ind)"
              icon
              fab
              style="width: 40px !important; border-radius: 100%"
              v-if="editable"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="d-flex justify-center">
            <v-btn
              dark
              block
              style="height: 36px !important"
              class="mt-1 text-uppercase"
              @click="addTimeSlot"
              v-if="editable"
            >
              <v-icon small class="mr-1">mdi-plus</v-icon>
              {{ $t("common.add") }} {{ $t("common.dose") }}
              {{ data.timeSlots.length + 1 }}
            </v-btn>
          </div>
          <h3 class="text-center mt-5">{{ $t("common.medicineList") }}</h3>
          <drug-selected :editable="editable" v-model="data.drugIds" />

          <!-- <div class="d-flex mt-5">
            <v-select
              v-model="data.remindBeforeMinutes"
              :items="optionsBeforeMinutes"
              :label="$t('medicine.remindBefore')"
              filled
              outlined
              required
              hide-details
              style="width: 45% !important"
              :disabled="!editable"
            ></v-select>
            <v-spacer></v-spacer>
            <v-select
              v-model="data.repeatType"
              :items="repeatTypeOptions"
              :label="$t('common.repeat')"
              filled
              outlined
              required
              hide-details
              style="width: 45% !important"
              @change="data.loopPatterns = []"
              :disabled="!editable"
            ></v-select>
          </div>
          <week-day-picker
            v-model="data.loopPatterns"
            v-if="data.repeatType == 2"
            :editable="editable"
          />
          <month-day-picker
            v-model="data.loopPatterns"
            v-if="data.repeatType == 3"
            :editable="editable"
          />
          <v-text-field
            v-model="data.loopPatterns[0]"
            :label="$t('common.date')"
            placeholder="DD/MM"
            filled
            outlined
            hide-details
            v-mask="'##/##'"
            v-if="data.repeatType == 4"
            :disabled="!editable"
          ></v-text-field>
          <v-text-field
            v-model="data.loopPatterns[0]"
            :label="$t('common.date')"
            placeholder="DD/MM/YYYY"
            filled
            outlined
            hide-details
            v-mask="'##/##/####'"
            v-if="data.repeatType == 0"
            :disabled="!editable"
          ></v-text-field>
          <user-participants
            class="mt-3 mb-3"
            v-model="data.participants"
            :title="$t('common.participant')"
            :editable="editable"
            :medicineId="medicineId"
          />-->
          <!-- <user-participants
            class="mb-3 mt-3"
            v-model="data.observers"
            :title="$t('common.observer')"
            :editable="editable"
            :medicineId="medicineId"
          /> -->
          <!-- <v-textarea
            v-model="data.message"
            :label="$t('medicine.message')"
            filled
            outlined
            required
            hide-details
            class="mt-4"
            rows="4"
            :disabled="!editable"
            :placeholder="$t('medicine.defaultMessage')"
          ></v-textarea>  -->
          <div class="d-flex justify-space-between">
            <v-btn
              class="mt-4 mb-2 text-uppercase"
              v-if="medicineId && editable"
              @click="completed"
              :loading="loading"
              color="success"
              dark
              style="width: 48%"
            >
              <v-icon left> mdi-check </v-icon>
              {{ $t("register.completed") }}
            </v-btn>
            <v-btn
              type="submit"
              class="mt-4 mb-2 text-uppercase"
              :loading="loading"
              :disabled="notValid || !editable"
              dark
              color="primary"
              style="width: 48%"
              :block="medicineId ? false : true"
            >
              <v-icon left> mdi-content-save-outline </v-icon>
              {{ $t("common.save") }}
            </v-btn>
          </div>
          <v-btn
            class="mt-4 mb-2 text-uppercase white--text"
            block
            v-if="data.userCreatedId != $uid"
            @click="exitMedicine"
            :loading="loading"
            color="red"
            style="width: 48%"
          >
            <v-icon left> mdi-logout </v-icon>
            {{ $t("register.cancalMonitor") }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <popup-time-picker ref="PopupTimePicker" @onValue="handlePopupTimePicker" />
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import ChooseFile from "@/components/ChooseFile.vue";
import ChooseIcon from "@/components/ChooseIcon.vue";
import PopupTimePicker from "@/components/PopupTimePicker.vue";
import WeekDayPicker from "./WeekDayPicker.vue";
import MonthDayPicker from "./MonthDayPicker.vue";
import UserParticipants from "./UserParticipants.vue";
import { uuidv4 } from "@/plugins/helpers";
import { mapGetters } from "vuex";
import DrugSelected from "@/components/drug/DrugSelected.vue";

function twoDigits(value) {
  if (value.toString().length <= 1) {
    return "0" + value.toString();
  }
  return value.toString();
}

export default {
  components: {
    ChooseFile,
    ChooseIcon,
    PopupTimePicker,
    WeekDayPicker,
    MonthDayPicker,
    UserParticipants,
    DrugSelected,
  },
  watch: {
    getViewMedicine(val) {
      if (!val) return;
      this.$store.commit("Mobile/SET_VIEW_MEDICINE", null);
      this.render(val);
    },
  },
  computed: {
    ...mapGetters("Mobile", ["getViewMedicine"]),
    notValid() {
      return (
        !this.data.medicineName ||
        // !this.data.description ||
        !this.data.timeSlots ||
        !this.data.timeSlots.length ||
        !this.data.participants ||
        !this.data.participants.length
      );
    },
    editable() {
      return (
        this.data &&
        this.data.userCreatedId &&
        this.data.userCreatedId == this.$uid &&
        this.data.isActive
      );
    },
  },
  data() {
    return {
      repeatTypeOptions: [
        { text: this.$t("common.norepeat"), value: 0 },
        { text: this.$t("common.daily"), value: 1 },
        { text: this.$t("common.weekly"), value: 2 },
        { text: this.$t("common.monthly"), value: 3 },
        { text: this.$t("common.yearly"), value: 4 },
      ],
      optionsBeforeMinutes: [
        {
          text: `15 ${this.$t("common.minute").toLowerCase()}`,
          value: 15,
        },
        {
          text: `30 ${this.$t("common.minute").toLowerCase()}`,
          value: 30,
        },
        {
          text: `60 ${this.$t("common.minute").toLowerCase()}`,
          value: 60,
        },
        {
          text: `1 ${this.$t("common.day").toLowerCase()}`,
          value: 24 * 60,
        },
        {
          text: `3 ${this.$t("common.day").toLowerCase()}`,
          value: 3 * 24 * 60,
        },
      ],
      loading: false,
      medicineId: null,
      data: {
        medicineId: uuidv4(),
        medicineName: "",
        description: "",
        repeatType: 1,
        avatar: "",
        documents: [],
        timeSlots: [{ time: "09:00" }],
        remindBeforeMinutes: 15,
        loopPatterns: [], // ["T4", "CN"], ["D12", "D25", "D7"],
        dateCreated: moment().format(),
        dateUpdated: moment().format(),
        userCreatedId: null,
        message: "Mẹ ơi đến giờ chích thuốc rồi.",
        observers: [],
        participants: [],
        isActive: true,
        drugIds: [],
      },
    };
  },
  async mounted() {
    this.data.userCreatedId = this.$uid;
    this.data.participants = [this.$phone];
    if (this.$route.params.id) {
      this.render(this.$route.params.id);
    }
    await this.getDoctorInCharge();
  },
  methods: {
    async getDoctorInCharge() {
      var doctorInCharge = await this.$dbGet(
        `patients/${this.$phone}/doctorInCharge`
      );
      // if (!doctorInCharge) {
      //   var doctorsObj = (await this.$dbGet(`doctors`)) || {};
      //   doctorInCharge = Object.keys(doctorsObj)[0] || "";
      // }
      if (doctorInCharge) {
        this.data.doctorInCharge = doctorInCharge;
        this.data.observers = [doctorInCharge];
      }
    },
    async exitMedicine() {
      if (!this.medicineId) return;
      if (!confirm(`${this.$t("common.removeMedicineConfirmMessage")}`)) return;
      this.loading = true;
      await axios.post(
        `https://us-central1-ivf-app-new.cloudfunctions.net/ivf_notifyUserCancel`,
        { medicineId: this.medicineId, phoneCancelled: this.$phone }
      );
      this.loading = false;
      this.$router.push("/history");
    },
    async render(medicineId) {
      if (!medicineId) return;
      this.medicineId = medicineId;
      var data = await this.$dbGet(`medicines/${medicineId}`);
      if (!data) return;
      data.loopPatterns = data.loopPatterns || [];
      data.participants = data.participants || [];
      data.observers = data.observers || [];
      data.drugIds = data.drugIds || [];
      this.data = data;
    },
    async getParticipantAvatar(phoneString = "") {
      phoneString = this.formatPhoneNumber(phoneString);
      var result = await this.$dbGet(`patients/${phoneString}/avatar`);
      if (!result) result = `public/icons/user.png`;
      return result;
    },
    async save() {
      this.loading = true;
      var medicineId = this.medicineId || this.data.medicineId;
      this.data.message =
        this.data.message || this.$t("medicine.defaultMessage");
      await this.$dbSet(`medicines/${medicineId}`, this.data);
      await this.$dbSet(`medicinesInProgress/${medicineId}`, true);
      if (this.medicineId) this.notifyMedicineUpdated(medicineId);
      else this.notifyParticipants(medicineId);
      await this.sleep(1200);
      this.showSuccess(this.$t("common.successMessage"));
      this.loading = false;
      this.playDing();
      this.$router.push("/history");
    },
    async notifyParticipants(medicineId) {
      if (!medicineId) return;
      var resp = axios.post(
        `https://us-central1-ivf-app-new.cloudfunctions.net/ivf_notifyMedicineParticipants?medicineId=${medicineId}`
        // `http://localhost:5001/sandrasoft-8fe2b/us-central1/ivf_notifyMedicineParticipants?medicineId=${medicineId}`
      );
      await this.sleep(1200);
      this.showSuccess(this.$t("common.successMessage"));
      console.log(resp.data);
    },
    async notifyMedicineUpdated(medicineId) {
      if (!medicineId) return;
      var resp = axios.post(
        `https://us-central1-ivf-app-new.cloudfunctions.net/ivf_notifyMedicineUpdated?medicineId=${medicineId}`
        // `http://localhost:5001/sandrasoft-8fe2b/us-central1/ivf_notifyMedicineParticipants?medicineId=${medicineId}`
      );
      await this.sleep(1200);
      this.showSuccess(this.$t("common.successMessage"));
      console.log(resp.data);
    },
    async completed() {
      var medicineId = this.medicineId || this.data.medicineId;
      if (!medicineId) return;
      if (!confirm(`${this.$t("common.completeMedicine")}`)) return;
      this.loading = true;
      axios.post(
        `https://us-central1-ivf-app-new.cloudfunctions.net/ivf_notifyMedicineCompleted?medicineId=${medicineId}`
        // `http://localhost:5001/sandrasoft-8fe2b/us-central1/ivf_notifyMedicineParticipants?medicineId=${medicineId}`
      );
      await this.sleep(1200);
      this.loading = false;
      this.showSuccess(this.$t("common.successMessage"));
      this.$router.push("/history");
    },
    handlePopupTimePicker({ keyId, value }) {
      if (keyId == null || keyId == undefined) return;
      this.data.timeSlots[keyId].time = value;
      this.$forceUpdate();
    },
    addTimeSlot() {
      this.data.timeSlots.push({
        time: moment()
          .set({ hour: 9 + 4 * this.data.timeSlots.length, minute: 0 })
          .format("HH:mm"),
      });
    },
    removeTimeSlot(ind) {
      this.data.timeSlots.splice(ind, 1);
    },
    handleTimeClicked(ind) {
      if (this.editable) this.$refs.PopupTimePicker.open(ind);
    },
  },
  filters: {
    formatHour(timeSlot) {
      var value = timeSlot.split(":")[0] || "";
      return twoDigits(value);
    },
    formatMinute(timeSlot) {
      var value = timeSlot.split(":")[1] || "";
      return twoDigits(value);
    },
  },
};
</script>

<style lang="scss">
.medicine_detail {
  @media screen and (min-width: 820px) {
    // background-color: rgba(30, 32, 55, 0.12);
  }
  .btn_choose_time {
    height: 55px !important;
    width: 55px !important;
    border-radius: 12px !important;
  }
  .title_text {
    line-height: 55px;
  }
}
.countdown {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  cursor: pointer;

  display: flex;
  justify-content: center;
  &__block {
    text-align: center;
    padding: 0px 15px;
    position: relative;
    &:first-child {
      padding-left: 0;
      .countdown__digit {
        &:before {
          display: none;
        }
      }
    }
    &:last-child {
      padding-right: 0;
    }
  }
  &__text {
    display: inline-block;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  &__digit {
    font-size: 2.5rem;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 3px;
    letter-spacing: 0.25rem;
    margin-left: 8px;
    &:before {
      content: ":";
      position: absolute;
      left: -5px;
    }
  }
}
.choosefile.cusomized {
  margin-top: -5px;
  position: absolute;
  left: calc(50vw + 20px);
  top: -10px;
}
</style>
