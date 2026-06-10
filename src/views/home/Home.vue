<template>
  <v-container class="ma-0 pa-1">
    <user-reminder class="mt-5" />
    <!-- <user-contacts class="mt-7" /> -->
    <hotline-list class="mt-7" />
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { Geolocation } from "@capacitor/geolocation";
// import UserContacts from "@/components/medicine/UserContacts.vue";
import UserReminder from "@/components/medicine/UserReminder.vue";
import HotlineList from "@/components/patient/HotlineList.vue";

export default {
  components: {
    // UserContacts,
    UserReminder,
    HotlineList,
  },
  computed: {
    ...mapGetters("Authen", ["getUser"]),
  },
  data() {
    return {
      welcome: {
        message: "",
        icon: "icons/trophy.png",
      },
      loading: false,
      loc: null,
    };
  },
  async mounted() {
    this.renderWelcome();
    // this.getCurrentPosition();
    // await this.sleep(2000);
    // this.updateAllDoctorInCharge();
  },
  methods: {
    async renderWelcome() {
      this.welcome.message = "Have a nice day at work !";
    },
    async getCurrentPosition() {
      var loc = await Geolocation.getCurrentPosition();
      var { latitude, longitude } = loc && loc.coords;
      this.loc = { lat: latitude, long: longitude };
    },
    async updateAllDoctorInCharge() {
      var patients = (await this.$dbGet(`users`)) || {};
      // console.log(patients);
      var ids = Object.keys(patients);
      for (var id of ids) {
        var phone = this.formatPhoneNumber(patients[id].phone);
        await this.$dbSet(`patients/${phone}/doctorInCharge`, "0283955095");
        console.log("Done", phone);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "./home.scss";
</style>
