<template>
  <v-menu transition="slide-y-transition" rounded offset-y min-width="150">
    <template v-slot:activator="{ attrs, on }">
      <div v-bind="attrs" v-on="on">
        <avartar style="float: left" />
        <v-toolbar-title
          class="ml-3 mt-1"
          style="font-size: 1.12rem; float: left"
        >
          {{ $t("common.welcome") }}, <b>{{ getUser.fullName }}.</b>
        </v-toolbar-title>
      </div>
    </template>
    <v-list nav dense>
      <v-list-item-group>
        <v-list-item
          link
          style="max-width: 260px"
          @click="$router.push('/setting')"
        >
          <v-list-item-icon style="margin: 10px 15px 10px 0px">
            <v-avatar size="24" style="border-radius: 0px">
              <img :src="getUser.avatar || '/icons/user.png'" alt="User" />
            </v-avatar>
          </v-list-item-icon>
          <v-list-item-title style="font-size: 1.05rem; line-height: 32px">
            {{ getUser.fullName }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout()" active-class="white_background">
          <v-list-item-icon style="margin: 10px 15px 10px 0px">
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              class="text-capitalize"
              style="font-size: 1rem; line-height: 32px"
              >{{ $t("user.logout") }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import avartar from "@/components/avartar.vue";
import { mapGetters } from "vuex";
import { getLocalStorage, removeLocalStorage } from "@/plugins/helpers";
import { cfaSignOut } from "capacitor-firebase-auth";

export default {
  components: { avartar },
  computed: {
    ...mapGetters("Authen", ["getUser"]),
  },
  data: function () {
    return {};
  },
  methods: {
    async logout() {
      var deviceToken = getLocalStorage("FcmDeviceToken");
      if (deviceToken) {
        await this.$dbRemove(`deviceToken/${this.$uid}/${deviceToken}`);
        removeLocalStorage("FcmDeviceToken");
      }
      cfaSignOut().subscribe();
      this.$store.commit("Authen/LOGOUT");
      await this.sleep(200);
      this.$router.go("/login");
    },
  },
};
</script>

<style lang="scss" scoped>
.white_background.v-list-item--link:before {
  background-color: white;
}
</style>
