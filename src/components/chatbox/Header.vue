<template>
  <v-card-title class="headerChatbox" style="background-color: #212121">
    <v-row align="center" style="display: flex" class="pa-0 ma-0">
      <img :src="receiver.avatar || '/icons/user.png'" class="avatarHeader" />
      <div class="ml-2">
        <h5>{{ receiver.fullName || $t("common.nodata") }}</h5>
        <v-row style="margin: 0" v-show="false">
          <span :class="receiver.onlineStatus ? 'green--text' : 'red--text'">
            ●
          </span>
          <p style="margin: 0; padding: 0" class="ml-1 offlineTime">
            {{ getOfflineTime() }} hours ago
          </p>
        </v-row>
      </div>
      <v-spacer></v-spacer>

      <v-btn class="btnCloseChatBox ml-3" icon @click="toggleBell">
        <v-icon color="white">{{
          isBellOff ? "mdi-bell-off" : "mdi-bell"
        }}</v-icon>
      </v-btn>
      <v-btn
        class="btnCloseChatBox ml-5 mr-3"
        icon
        @click="$emit('close-boxchat')"
      >
        <v-icon color="white" large>mdi-close</v-icon>
      </v-btn>
    </v-row>
  </v-card-title>
</template>

<script>
import moment from "moment";

export default {
  props: {
    conversationId: String,
    receiver: Object,
    remoteUserPhone: String,
  },
  data() {
    return {
      isBellOff: false,
    };
  },
  methods: {
    getOfflineTime() {
      let duration = moment();
      let offline = this.receiver.lastOnline;
      let offlineHours = duration.diff(offline, "hours");
      return offlineHours;
    },
    async getBellStatus() {
      if (!this.conversationId || !this.$uid) return;
      var isBellOff = await this.$dbGet(
        `conversations/${this.conversationId}/users/${this.$uid}/isBellOff`
      );
      if (!isBellOff) isBellOff = false;
      this.isBellOff = isBellOff;
    },
    async toggleBell() {
      if (!this.conversationId || !this.$uid) return;
      var newBellStatus = !this.isBellOff;
      await this.$dbSet(
        `conversations/${this.conversationId}/users/${this.$uid}/isBellOff`,
        newBellStatus
      );
      this.isBellOff = newBellStatus;
    },
  },
};
</script>

<style lang="scss">
.avatarHeader {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.offlineTime {
  color: #37474f;
  font-size: 13px;
}
</style>
