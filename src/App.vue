<template>
  <v-app>
    <chatbox />
    <transition name="fade-transition">
      <router-view />
    </transition>
    <qrcode-stream
      v-if="showScanner"
      :camera="camera"
      @decode="onDecode"
    ></qrcode-stream>
    <v-btn
      fixed
      @click="closeScanner"
      v-if="showScanner"
      style="left: calc(50vw - 30px); bottom: 20px"
      fab
      dark
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-app>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";
import { Camera } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { PushNotifications } from "@capacitor/push-notifications";
import { FCM } from "@capacitor-community/fcm";
import Chatbox from "@/components/Chatbox.vue";

export default {
  name: "App",
  components: { QrcodeStream, Chatbox },
  computed: {
    showScanner() {
      return this.$store.getters["Scanner/getShowScanner"] || false;
    },
  },
  async created() {
    console.log("this.$uid", this.$uid);
    if (Capacitor.isNativePlatform()) {
      Camera.requestPermissions();
      PushNotifications.addListener("registration", async (token) => {
        if (Capacitor.getPlatform() == "ios") {
          FCM.getToken()
            .then(async (result) => {
              var deviceToken = result.token;
              console.log("iOS FCM Device Token", deviceToken);
              await this.handleDeviceToken(deviceToken);
            })
            .catch((err) => console.log("FCM.getToken() Error", err));
          return;
        }
        var deviceToken = token.value;
        console.log("Android FCM Device Token", deviceToken);
        await this.handleDeviceToken(deviceToken);
      });
      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          console.log(
            "Push notification received: ",
            JSON.stringify(notification)
          );
          this.handleNotification({ notification });
        }
      );
    } else {
      this.$fcm.onMessage(this.handleNotification);
    }

    Network.addListener("networkStatusChange", (status) => {
      console.log("Network status changed", status);
      this.$store.commit(
        "Mobile/SET_NETWORK_STATUS",
        status && status.connected
      );
      if (status && status.connected) {
        this.syncOfflineEpisodes();
      }
    });

    const status = await Network.getStatus();
    this.$store.commit("Mobile/SET_NETWORK_STATUS", status && status.connected);

    // This need to run AFTER the Notification listeners
    this.registerNotificationToken();
  },
  data() {
    return {
      camera: "auto",
    };
  },
  methods: {
    async onDecode(decodedString) {
      if (!decodedString) return;
      var deviceId = decodedString.split("?DID=")[1];
      if (deviceId) {
        this.$store.commit("Scanner/SET_SCANNED_DEVICE_ID", deviceId);
      }
      var phone = decodedString.split("?PHONE=")[1];
      if (phone) {
        this.$store.commit("Scanner/SET_SCANNED_PHONE_NUMBER", phone);
      }
      // reset cache camera
      this.pause();
      await this.sleep(200);
      this.unpause();
      // close scanner
      this.closeScanner();
    },
    unpause() {
      this.camera = "auto";
    },
    pause() {
      this.camera = "off";
    },
    closeScanner() {
      this.$store.commit("Scanner/CLOSE_SCANNER");
    },
  },
};
</script>

<style lang="scss">
@import "./App.scss";
</style>
