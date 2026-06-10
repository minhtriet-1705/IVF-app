<template>
  <v-container class="ma-0 pa-0 justify-center user_reminder">
    <h3 class="mb-3">
      <v-icon color="black" class="title_icon"> mdi-calendar-check </v-icon>
      {{ $t("common.reminder") }}:
      <v-btn
        fab
        x-small
        elevation="0"
        style="float: right"
        @click="render"
        icon
      >
        <v-icon style="font-size: 1.6rem" color="#212121">mdi-refresh</v-icon>
      </v-btn>
    </h3>
    <div style="text-align: center" v-show="loading" class="mb-5">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div v-show="!loading">
      <div v-if="showCards" style="width: 360px; margin: 0 auto 0 auto">
        <vue-card-stack
          :cards="cards"
          :scaleMultiplier="0.2"
          :stack-width="360"
          :card-width="320"
          style="margin-top: -15px"
        >
          <template v-slot:card="{ card }">
            <div
              style="width: 100%; height: 100%; border-radius: 12px"
              class="pa-2 memorial_card"
              :style="{ background: card.background }"
            >
              <div class="d-flex justify-center">
                <v-avatar size="64px" tile>
                  <img
                    alt="Avatar"
                    :src="
                      (card.medicine && card.medicine.avatar) ||
                      '/icons/bell.png'
                    "
                    @click="$router.push(`/medicine/${card.medicineId}`)"
                  />
                </v-avatar>
              </div>
              <h3
                class="text-center mb-1 mt-3 w-100"
                style="font-size: 1.3rem"
                @click="$router.push(`/medicine/${card.medicineId}`)"
              >
                {{
                  (card.notification && card.notification.title) ||
                  $t("medicine.name")
                }}
              </h3>
              <p>
                {{ card.notification && card.notification.body }}
              </p>

              <count-down :auto-start="true" :auto-seconds="card.seconds" />

              <div class="d-flex justify-space-around mt-1">
                <v-btn
                  rounded
                  style="width: 45%"
                  outlined
                  class="red-text"
                  @click="
                    $refs.PopupConfirmAction.open(
                      card.actionId,
                      'cancel',
                      card.medicine.medicineName
                    )
                  "
                >
                  {{ $t("common.cancel") }}
                </v-btn>
                <v-btn
                  dark
                  color="dark"
                  rounded
                  style="width: 50%"
                  elevation="0"
                  v-if="card.seconds > -1800"
                  @click="
                    $refs.PopupConfirmAction.open(
                      card.actionId,
                      'done',
                      card.medicine.medicineName
                    )
                  "
                >
                  {{ $t("common.confirm") }}
                </v-btn>
              </div>
              <p style="font-size: 0.8rem" class="mt-2 pa-0">
                {{ card.dateCreatedString }}
              </p>
            </div>
          </template>
        </vue-card-stack>
      </div>

      <div v-else class="mb-3">
        <lottie-loader :url="'/lottie/no-data.json'" :width="'270px'" />
        <h5 class="no_data mt-3" v-html="$t('common.reminder_nodata')"></h5>
      </div>
    </div>
    <div class="text-center">
      <v-btn
        dark
        color="dark"
        rounded
        class="pa-5"
        small
        @click="$router.push('/medicine')"
      >
        <v-icon left> mdi-plus </v-icon>
        {{ $t("common.add") }}
        {{ $t("common.reminder") }}
      </v-btn>
    </div>
    <!-- <popup-confirm-action ref="PopupConfirmAction" @done="handleActionDone" /> -->
    <popup-confirm-action ref="PopupConfirmAction" />
  </v-container>
</template>

<script>
import LottieLoader from "@/components/LottieLoader.vue";
import CountDown from "@/components/CountDown.vue";
import moment from "moment";
import PopupConfirmAction from "./PopupConfirmAction.vue";

export default {
  components: { LottieLoader, CountDown, PopupConfirmAction },
  data() {
    return {
      loading: true,
      cards: [],
      showCards: false,
      BackgroundCode: {
        green: "#00abbc",
        blue: "#0091EA",
        red: "#fc8890",
      },
    };
  },
  async mounted() {
    await this.sleep(1200);
    await this.render();
    await this.registerWatcherMedicineInProgress();
  },
  methods: {
    async registerWatcherMedicineInProgress() {
      this.$dbWatcher(`patients/${this.$phone}/actionsInProgress`, async () => {
        this.render();
      });
    },
    async getDetail(actionId) {
      if (!actionId) return null;
      var medicineId = actionId.split("___")[0];
      if (!medicineId) return null;
      var action = await this.$dbGet(`actions/${medicineId}/${actionId}`);
      return action || null;
    },
    calibBackground({ dateScheduled }) {
      console.log(dateScheduled);
      if (!dateScheduled) return this.BackgroundCode.red;
      var seconds = this.calibSeconds({ dateScheduled });
      if (seconds < -1800) return this.BackgroundCode.red;
      else if (seconds <= 0) return this.BackgroundCode.green;
      else return this.BackgroundCode.blue;
    },
    calibSeconds({ dateScheduled }) {
      if (!dateScheduled) return -1;
      var now = moment(); //todays date
      dateScheduled = moment(dateScheduled);
      var duration = moment.duration(dateScheduled.diff(now));
      var seconds = Math.round(duration.asSeconds());
      return seconds;
    },
    async handleActionDone(actionId = "") {
      if (!actionId) return;
      this.showCards = false;
      this.loading = true;
      await this.sleep(400);
      this.cards = this.cards.filter((c) => c.actionId != actionId);
      if (!this.cards.length) {
        this.items = [];
        this.$forceUpdate();
        this.showCards = false;
        this.loading = false;
        return;
      }
      if (this.cards.length && this.cards.length < 3) {
        while (this.cards.length < 3) {
          this.cards.push(this.cards[this.cards.length - 1]);
        }
      }
      this.$forceUpdate();
      this.showCards = true;
      this.loading = false;
    },
    async render() {
      this.showCards = false;
      this.loading = true;
      var actionObj = await this.$dbGet(
        `patients/${this.$phone}/actionsInProgress`
      );
      if (!actionObj) {
        this.items = [];
        this.showCards = false;
        this.loading = false;
        return;
      }
      var actionIds = Object.keys(actionObj);
      var promises = [];
      actionIds.forEach((id) => promises.push(this.getDetail(id)));
      Promise.all(promises)
        .then(async (values) => {
          if (!values || !values.length) {
            this.items = [];
            this.showCards = false;
            this.loading = false;
            return;
          }
          values = values
            ? values
                .filter((p) => !!p)
                .sort(
                  (a, b) =>
                    moment(b.dateCreated).valueOf() -
                    moment(a.dateCreated).valueOf()
                )
            : [];

          values = values.map((val) => ({
            ...val,
            background: this.calibBackground(val),
            seconds: this.calibSeconds(val),
            dateCreatedString: `${moment(val.dateCreated).format(
              "HH:mm, DD-MM-YYYY"
            )}`,
          }));
          this.loading = false;
          while (values.length < 3) {
            values.push(values[values.length - 1]);
          }
          this.cards = values;
          this.$forceUpdate();
          this.showCards = true;
          console.log(this.cards);
        })
        .catch((err) => console.error(err));
    },
  },
};
</script>
