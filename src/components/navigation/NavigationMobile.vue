<template>
  <v-toolbar
    class="mobile_header_drawer d-print-none"
    flat
    height="56"
    width="768"
    v-if="!getIsMeasuring"
  >
    <menu-change-profile />
    <v-spacer />
    <!-- <v-btn
      @click="clickNotifcation"
      fab
      elevation="0"
      style="background-color: transparent !important"
    >
      <v-badge
        color="error"
        overlap
        style="z-index: 5"
        offset-x="-20"
        offset-y="-8"
        dot
        v-if="showNotification"
      >
      </v-badge>
      <v-icon style="opacity: 0.8"> mdi-bell </v-icon>
    </v-btn> -->
    <notification ref="Notification" />
  </v-toolbar>
</template>

<script>
import MenuChangeProfile from "./menuChangeProfile.vue";
import { mapGetters } from "vuex";
import Notification from "@/components/medicine/Notification.vue";

export default {
  components: {
    MenuChangeProfile,
    Notification,
  },
  computed: {
    ...mapGetters("Authen", ["getUser"]),
    ...mapGetters("Scanner", ["getIsMeasuring"]),
    ...mapGetters("Offline", ["unSyncedCounts", "syncedCounts"]),
  },
  watch: {},
  data: function () {
    return {
      diaglog: false,
      showNotification: false,
    };
  },
  mounted() {
    // console.log(this.$route);
    this.listeningHasNewNotification();
  },
  methods: {
    startRequestBleDevice() {
      this.$store.commit("Scanner/OPEN_BLE_REQUEST");
    },
    async clickNotifcation() {
      this.$dbSet(`patients/${this.$phone}/newNotification`, false);
      this.$refs.Notification.open();
    },
    async listeningHasNewNotification() {
      this.$dbWatcher(
        `patients/${this.$phone}/newNotification`,
        async (newNotification) => {
          console.log(newNotification);
          this.showNotification = newNotification || false;
          this.$forceUpdate();
        }
      );
    },
  },
};
</script>
