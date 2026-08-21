import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import store from "./stores";
import i18n from "./lang/i18n";
import "./registerServiceWorker";

import VueMask from "v-mask";
Vue.use(VueMask);

import VueCardStack from "vue-card-stack";
Vue.use(VueCardStack);

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
Vue.use(Toast, {
  transition: "Vue-Toastification__fade",
  maxToasts: 1,
  newestOnTop: true,
  hideProgressBar: true,
  position: "top-center",
  timeout: 3000,
});

import Highcharts from "highcharts";
import VueHighcharts from "highcharts-vue";
import highchartsMore from "highcharts/highcharts-more";
import heatmap from "highcharts/modules/heatmap";

heatmap(Highcharts);
highchartsMore(Highcharts);
Vue.use(VueHighcharts, { Highcharts });

import { FirebaseMessaging, database } from "@/plugins/firebase";
import { HttpClient } from "./plugins/httpClient";
import { sleep } from "@/plugins/helpers";
import moment from "moment";

var BLE_APP_API_URL = "https://his-api-dev-vik5qm7zgq-et.a.run.app";
import { Capacitor } from "@capacitor/core";

function loopAudio(myAudio) {
  myAudio.addEventListener(
    "ended",
    function () {
      this.currentTime = 0;
      this.play();
    },
    false
  );
}

import { PushNotifications } from "@capacitor/push-notifications";

var databasePrefix = "myivf";

Vue.mixin({
  computed: {
    isAdmin() {
      return this.$phone.includes("0111111111");
    },
    soundSfx() {
      var love = new Audio("/sounds/love.mp3");
      var ding = new Audio("/sounds/ding.mp3");
      var alarm = new Audio("/sounds/alarm.mp3");
      var wait = new Audio("/sounds/wait.mp3");
      var nof = new Audio("/sounds/nof.mp3");
      loopAudio(love);
      loopAudio(wait);
      return {
        love,
        ding,
        alarm,
        wait,
        nof,
      };
    },
    networkStatus() {
      return this.$store.getters["Mobile/getNetworkStatus"];
    },
    isNative() {
      return Capacitor.isNativePlatform();
    },
    isiOS() {
      return (
        Capacitor.isNativePlatform() &&
        Capacitor.getPlatform().toLowerCase() == "ios"
      );
    },
    isAndroid() {
      return (
        Capacitor.isNativePlatform() &&
        Capacitor.getPlatform().toLowerCase() == "android"
      );
    },
    isLargeWebVersion() {
      return this.$vuetify.breakpoint.width >= 1280;
    },
    isWebVersion() {
      return this.$vuetify.breakpoint.width >= 820;
    },
    isMobileVersion() {
      return this.$vuetify.breakpoint.width < 680;
    },
    $uid() {
      return this.$store.getters["Authen/getUser"].id || null;
    },
    $fullName() {
      return this.$store.getters["Authen/getUser"].fullName || null;
    },
    $phone() {
      return this.formatPhoneNumber(
        this.$store.getters["Authen/getUser"].phone
      );
    },
    $httpClient() {
      return new HttpClient(BLE_APP_API_URL);
    },
    $fcm() {
      return FirebaseMessaging;
    },
    statusCode() {
      return {
        Danger: 0,
        Info: 1,
        Warning: 2,
        Success: 3,
      };
    },
    $db() {
      return database;
    },
    $dbRef() {
      return database.ref();
    },
    $printOptions() {
      if (this.isiOS) {
        return {
          enableDownload: false,
          previewModal: true,
        };
      }
      if (this.isAndroid) {
        return {
          enableDownload: true,
          previewModal: false,
        };
      }
      return {
        enableDownload: true,
        previewModal: false,
      };
    },
  },
  mounted() {},
  methods: {
    sleep,
    async playWaitingRingtone() {
      await this.playSfx(`wait`);
    },
    async stopWaitingRingtone() {
      await this.stopSfx(`wait`);
    },
    async playIncomingRingtone() {
      await this.playSfx("love");
    },
    async stopIncomingRingtone() {
      await this.stopSfx("love");
    },
    async playDing() {
      await this.playSfx("ding");
    },
    async playAlarm() {
      await this.playSfx("alarm");
    },
    async playNof() {
      await this.playSfx("nof");
    },
    async playSfx(name = "ding") {
      await this.stopSfx(name);
      this.soundSfx[name].play();
    },
    async stopSfx(name = "ding") {
      this.soundSfx[name].pause();
      this.soundSfx[name].currentTime = 0;
      await this.sleep(50);
    },
    reloadCurrentPage() {
      window.location.reload();
    },
    genderName(code) {
      var names = Object.keys(GenderType);
      return names[code - 1];
    },
    formatPhoneNumber(str) {
      if (!str) return "";
      var strPhone = str.split(" ").join("").split("-").join("").slice(-9);
      return `0${strPhone}`;
    },
    formatDate(date) {
      if (!date) return "";
      return moment(date).format("DD/MM/YYYY HH:mm");
    },
    padZeros(n, width, z) {
      if (!n) return null;
      z = z || "0";
      n = n + "";
      return n.length >= width
        ? n
        : new Array(width - n.length + 1).join(z) + n;
    },
    roundBatteryPercentage(val) {
      if (!val) return null;
      try {
        return Math.round(val / 10) * 10;
      } catch (err) {
        console.log("BatteryRoundPercentage Error", err);
        return null;
      }
    },
    callPhone(phone) {
      if (!phone) return;
      if (Capacitor.isNativePlatform()) window.open(`tel:${phone}`);
      else window.open(`https://zalo.me/${phone}`);
    },
    back() {
      history.back();
    },
    getNotificationIcon(notification) {
      if (!notification) return false;
      var { title } = notification;
      title = title.toLowerCase();
      if (title.includes("huỷ") || title.includes("nhỡ"))
        return `/icons/close.png`;
      if (title.includes("hoàn thành")) return `/icons/tick.png`;
      return `/icons/bell.png`;
    },
    getNotificationFilter(notification) {
      if (!notification) return false;
      var { title } = notification;
      title = title.toLowerCase();
      if (title.includes("huỷ") || title.includes("nhỡ")) return true;
      if (title.includes("hoàn thành")) return true;
      return false;
    },
    openDiaglogIfMobile(title) {
      if (this.isMobileVersion) {
        this.$store.commit("Mobile/SET_DIAGLOG_STATE", true);
        this.$store.commit("Mobile/SET_DIAGLOG_TITLE", title);
      }
    },
    closeDiaglogIfMobile() {
      if (this.isMobileVersion) {
        this.$store.commit("Mobile/SET_DIAGLOG_STATE", false);
        this.$store.commit("Mobile/SET_DIAGLOG_TITLE", "");
      }
    },
    openInNewTabIfBrowser(url) {
      if (url.includes("http")) return window.open(url, "_blank");
      // if (!this.isNative) return window.open(url, "_blank");
      return this.$router.push(url);
    },
    showError: function (message) {
      console.error(message);
    },
    showErrorPopup(message) {
      this.$toast.error(message);
    },
    showSuccess: function (message) {
      this.$toast.success(message);
    },
    showInfo: function (message) {
      this.$toast.info(message);
    },
    showWarning: function (message) {
      this.$toast.warning(message);
    },
    async calibBleSeverity(datapoint) {
      var { sys, dia } = datapoint;
      if (!sys || !dia) return;
      if (sys > 148 || dia > 120) {
        this.playAlarm();
        await this.sleep(5000);
        this.playAlarm();
        return BleSeverity.Severe;
      } else if (sys > 128 || dia > 100) {
        this.playAlarm();
        return BleSeverity.High;
      } else if (sys > 90 || dia > 60) {
        this.playDing();
        return BleSeverity.Normal;
      } else {
        this.playDing();
        return BleSeverity.Low;
      }
    },
    calibDataSeverity(datapoint) {
      var { sys, dia } = datapoint;
      if (!sys || !dia) return null;
      if (sys > 148 || dia > 120) {
        return BleSeverity.Severe;
      } else if (sys > 128 || dia > 100) {
        return BleSeverity.High;
      } else if (sys > 90 || dia > 60) {
        return BleSeverity.Normal;
      } else {
        return BleSeverity.Low;
      }
    },
    getDataSeverityColor(datapoint) {
      var result = this.calibDataSeverity(datapoint);
      if (result == BleSeverity.Severe) return "#F06292";
      if (result == BleSeverity.High) return "#FFB74D";
      if (result == BleSeverity.Normal) return "#81C784";
      if (result == BleSeverity.Low) return "#4DD0E1";
    },
    getDataSeverityName(datapoint) {
      var result = this.calibDataSeverity(datapoint);
      if (result == BleSeverity.Severe) return "Severe";
      if (result == BleSeverity.High) return "High";
      if (result == BleSeverity.Normal) return "Normal";
      if (result == BleSeverity.Low) return "Low";
    },
    async syncOfflineEpisodesSubscribers(episode = {}, getSubscriptions = []) {
      var { patientId, id, datapoints } = episode;
      if (!patientId || !id || !datapoints) return;
      var datacounts = datapoints.length;
      var lookup = JSON.parse(JSON.stringify(episode));
      delete lookup.note;
      delete lookup.datapoints;
      // Only sync data into subscribers if phone == user's login phone
      if (patientId == this.$phone) {
        for (var subscriber of getSubscriptions) {
          await this.$dbSet(`users/${subscriber.id}/episodes/${id}`, lookup);
          await this.$dbSet(
            `users/${subscriber.id}/episodes/${id}/datacounts`,
            datacounts
          );
        }
      }
    },
    async syncOfflineEpisodes() {
      if (this.networkStatus) {
        var episodes = this.$store.getters["Offline/offlineEpisodes"] || [];
        var getSubscriptions = await this.$dbGet(`subscribe/${this.$uid}`);
        if (getSubscriptions) {
          getSubscriptions = Object.values(getSubscriptions).filter(
            (i) => i.isSubscribed
          );
        } else {
          getSubscriptions = [];
        }
        for (var lastEpisode of episodes) {
          console.log(">>>> syncOfflineEpisode", lastEpisode);
          var { id, datapoints, patientObject } = lastEpisode;
          if (!id) continue;
          var data = JSON.parse(JSON.stringify(lastEpisode));
          await this.$dbSet(`episodes/${id}`, data);
          var lookup = JSON.parse(JSON.stringify(data));
          delete lookup.note;
          delete lookup.datapoints;
          await this.$dbSet(`users/${this.$uid}/episodes/${id}`, lookup);
          await this.$dbSet(
            `users/${this.$uid}/episodes/${id}/datacounts`,
            datapoints.length
          );
          this.syncOfflineEpisodesSubscribers(lastEpisode, getSubscriptions);
          if (patientObject) {
            var { phone, fullName } = patientObject;
            phone = this.formatPhoneNumber(phone);
            if (phone && fullName) {
              var patientExist = await this.$dbGet(`patients/${phone}`);
              if (patientExist) {
                patientObject = { ...patientObject, ...patientExist };
              }
              await this.$dbSet(`patients/${phone}`, patientObject);
              await this.$dbSet(`users/${this.$uid}/patients/${phone}`, {
                fullName,
              });
              // Ping Patient
              await this.sleep(1000);
              this.$dbSet(`patients/${phone}/currentEpisodeId`, id);
              await this.sleep(1000);
              this.$dbSet(`patients/${phone}/currentEpisodeId`, "");
            }
          }
          this.$store.commit("Offline/DELETE_OFFLINE_EPISODE", id);
          this.$store.commit("Offline/INCREASE_SYNCED_COUNTS");
          await this.sleep(4000);
          this.$store.commit("Offline/VALIDATE_SYNC_COUNTS");
        }
      }
    },
    async $dbWatcher(ref, func) {
      database.ref(`${databasePrefix}/${ref}`).on("value", (snapshot) => {
        var val = snapshot.val();
        if (!func) return;
        func(val || null);
      });
    },
    async $dbSet(ref, data) {
      if (!this.networkStatus) return true;
      return new Promise((resolve) => {
        return database.ref(`${databasePrefix}/${ref}`).set(data, (err) => {
          if (err) {
            alert(err.message);
            return resolve(false);
          }
          return resolve(true);
        });
      });
    },
    async $dbRemove(ref) {
      if (!this.networkStatus) return true;
      return new Promise((resolve) => {
        database
          .ref(`${databasePrefix}/${ref}`)
          .remove()
          .then(() => {
            return resolve(true);
          });
      });
    },
    async $dbUpdate(ref, updates) {
      if (!this.networkStatus) return true;
      return new Promise((resolve) => {
        database
          .ref()
          .child(databasePrefix)
          .child(ref)
          .update(updates, () => {
            return resolve(true);
          })
          .catch((error) => {
            console.error(error);
            return resolve(false);
          });
      });
    },
    async $dbGet(ref) {
      if (!this.networkStatus) return true;
      return new Promise((resolve) => {
        database
          .ref()
          .child(databasePrefix)
          .child(ref)
          .get()
          .then((snapshot) => {
            if (snapshot.exists()) {
              return resolve(snapshot.val());
            } else {
              console.log("No data available");
              return resolve(false);
            }
          })
          .catch((error) => {
            console.error(error);
            return resolve(false);
          });
      });
    },
    async addDoctorInChargeToPatientProfile({ phone, fullName }) {
      if (!phone || !fullName) return;
      phone = this.formatPhoneNumber(phone);
      await this.$dbSet(`patients/${this.$phone}/doctorInCharge`, phone);
      await this.$dbSet(`users/${this.$uid}/patients/${phone}`, { fullName });
    },
    async ensurePatientProfileExist() {
      if (!this.networkStatus) return true;
      var userObj = this.$store.getters["Authen/getUser"];
      if (!userObj) {
        console.log(
          "Cannot ensure patient profile because user object is missing!"
        );
        return;
      }
      var { phone, id, fullName } = userObj;
      if (!phone || !id || !fullName) {
        console.log(
          "Cannot ensure patient profile because user phone or id or full name is missing!"
        );
        return;
      }
      var phoneString = this.formatPhoneNumber(phone);

      var patientObj = await this.$dbGet(`patients/${phoneString}`);
      if (patientObj) {
        patientObj = {
          ...patientObj,
          ...userObj,
          phone: phoneString,
          id,
        };
        delete patientObj.episodes;
        delete patientObj.patients;
        await this.$dbUpdate(`patients/${phoneString}`, patientObj);
      } else {
        patientObj = {
          ...userObj,
          phone: phoneString,
          id,
        };
        delete patientObj.episodes;
        delete patientObj.patients;
        await this.$dbSet(`patients/${phoneString}`, patientObj);
      }
      await this.$dbSet(`users/${id}/patients/${phoneString}`, {
        fullName,
      });
    },
    async handleDeviceToken(deviceToken) {
      if (!this.$uid || !deviceToken) return;
      setLocalStorage("FcmDeviceToken", deviceToken);
      await this.$dbSet(
        `deviceToken/${this.$uid}/${deviceToken}`,
        moment().format()
      );
    },
    async registerNotificationToken() {
      try {
        if (!this.$uid) return;
        if (Capacitor.isNativePlatform()) {
          await this.registerNativeNotificationToken();
        } else {
          await this.registerWebNotificationToken();
        }
      } catch (err) {
        console.error(">>> registerNotificationToken Error", err.code, err.message, err);
      }
    },
    async registerNativeNotificationToken() {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== "granted") {
        console.log("User denied permissions!");
        return;
      }
      await PushNotifications.register();
    },
    async registerWebNotificationToken() {
      var deviceToken = await getDeviceFcmToken();
      // console.log("FCM Device Token", deviceToken);
      await this.handleDeviceToken(deviceToken);
    },
    async handleNotification(payload = {}) {
      // console.log(payload);
      this.playNof();
      // for iOS we also receive noti on the forground
      // so,no need to show the toast nitification
      if (Capacitor.getPlatform().toLowerCase() == "ios") return;
      if (!payload) return;
      var { notification } = payload;
      if (!notification) return;
      var { title, body } = notification;
      if (!title || !body) return;
      var message = `${title}: ${body}`;
      if (this.isiOS) message = body;
      this.showInfo(message);
    },
    async handleHtml2PdfDownloaded(blob) {
      if (!this.isNative) return;
      var prefix = `report/${this.$uid}/${moment().format("YYYY-MM-DD")}`;
      var donwloadUrl = await firebaseUploadBlob(blob, prefix, "report.pdf");
      console.log(donwloadUrl);
      if (!donwloadUrl) return;
      return donwloadUrl;
    },
    async shareLink(url) {
      if (!url || !this.isNative) return;
      await Share.share({
        title: "Báo cáo Huyết Áp",
        text: `Báo cáo dữ liệu huyết áp của tôi lúc ${moment().format(
          "YYYY-DD-MM HH:mm"
        )}.`,
        url,
        dialogTitle: "Báo cáo Huyết Áp",
      });
    },
    async sendDataToSandrasoftIframe(
      eventName = EventName.onDatapointReceived,
      data = {}
    ) {
      if (!window || !window.parent || !window.parent.postMessage) return;
      var message = {
        appName: "HolterVN",
        eventName,
        data,
      };
      try {
        window.parent.postMessage(JSON.stringify(message), "*");
      } catch (err) {
        console.log("sendDataToSandrasoftIframe Error", err.message);
      }
    },
    sortDatapoints(datapoints = []) {
      return datapoints.sort(
        (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()
      );
    },
    calculateStats(datapoints = []) {
      var points = JSON.parse(JSON.stringify(datapoints));
      var lowPoints = points.filter((p) => p.sys < 90);
      var normPoints = points.filter((p) => 90 <= p.sys && p.sys < 128);
      var highPoints = datapoints.filter((p) => 128 <= p.sys && p.sys < 148);
      var veryHighPoints = points.filter((p) => p.sys >= 148);

      return {
        low: {
          count: lowPoints.length,
          percent: Math.floor((lowPoints.length / datapoints.length) * 100),
          pulse: this.calibAverage(lowPoints, "pulse"),
          sys: this.calibAverage(lowPoints, "sys"),
          dia: this.calibAverage(lowPoints, "dia"),
        },
        normal: {
          count: normPoints.length,
          percent: Math.floor((normPoints.length / datapoints.length) * 100),
          pulse: this.calibAverage(normPoints, "pulse"),
          sys: this.calibAverage(normPoints, "sys"),
          dia: this.calibAverage(normPoints, "dia"),
        },
        high: {
          count: highPoints.length,
          percent: Math.floor((highPoints.length / datapoints.length) * 100),
          pulse: this.calibAverage(highPoints, "pulse"),
          sys: this.calibAverage(highPoints, "sys"),
          dia: this.calibAverage(highPoints, "dia"),
        },
        veryHigh: {
          count: veryHighPoints.length,
          percent: Math.floor(
            (veryHighPoints.length / datapoints.length) * 100
          ),
          pulse: this.calibAverage(veryHighPoints, "pulse"),
          sys: this.calibAverage(veryHighPoints, "sys"),
          dia: this.calibAverage(veryHighPoints, "dia"),
        },
      };
    },
    calibAverage(points = [], field = "pulse") {
      var sum = 0;
      var count = 0;
      for (var point of points) {
        if (point[field]) {
          sum += point[field];
          count += 1;
        }
      }
      if (!count) return 0;
      return Math.floor(sum / count);
    },
    getErrorCodesFrom16Bits(bits16 = "") {
      if (!bits16) return [];
      var result = [];
      if (bits16[15] == "1") result.push(this.$t("error.bodyMovement"));
      if (bits16[14] == "1") result.push(this.$t("error.noHandInCuff"));
      if (bits16[13] == "1") result.push(this.$t("error.noHandInCuff"));
      if (bits16[12] == "1") result.push(this.$t("error.overshoot"));
      // if (bits16[11] == "0" && bits16[12] == "1")
      //   result.push(this.$t("error.pulseExceed"));
      // if (bits16[11] == "1" && bits16[12] == "0")
      //   result.push(this.$t("error.pulseLower"));
      if (bits16[10] == "1") result.push(this.$t("error.improperPosition"));
      // if (bits16[8] == "1") result.push(this.$t("error.measurementFailed"));
      // if (bits16[7] == "1") result.push(this.$t("error.maxdistanceFailed"));
      // if (bits16[6] == "1") result.push(this.$t("error.noSysDia"));
      // if (bits16[5] == "1") result.push(this.$t("error.periodFailed"));
      // if (bits16[4] == "1") result.push(this.$t("error.unknownError"));
      if (!result.length) result = [this.$t("error.noSysDia")];
      return result.filter(
        (value, index, self) => self.indexOf(value) === index
      );
    },
    async getUserLite(uid = "") {
      if (!uid) return null;
      var phone = await this.$dbGet(`users/${uid}/phone`);
      if (!phone) return null;
      return {
        id: uid,
        fullName: await this.$dbGet(`users/${uid}/fullName`),
        gender: await this.$dbGet(`users/${uid}/gender`),
        avatar: await this.$dbGet(`users/${uid}/avatar`),
        phone,
      };
    },
  },
});

Vue.config.productionTip = false;

export const VueInstance = new Vue({
  i18n,
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");

import { Share } from "@capacitor/share";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { BleSeverity, EventName, GenderType } from "./plugins/constants";
import { firebaseUploadBlob, getDeviceFcmToken } from "./plugins/firebase";
import { setLocalStorage } from "./plugins/helpers";
defineCustomElements(window);
