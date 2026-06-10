<template>
  <div>
    <div style="width: 100%; text-align: center" class="mb-5">
      <img src="/icons/book.png" width="80" />
      <p class="mt-1">{{ $t("common.conversationStart") }}</p>
    </div>

    <div v-for="(contentbody, objKey, index) in messages" :key="objKey">
      <div class="w-100 text-center mt-3" v-if="calculateShowChipDate(index)">
        <v-divider style="margin-bottom: -13px"></v-divider>
        <v-chip small>{{ formatDate(contentbody.time) }}</v-chip>
      </div>
      <div
        :class="
          contentbody.userId == $uid ? 'containerMesRight' : 'containerMesLeft'
        "
      >
        <div class="container2Mes">
          <img
            v-if="contentbody.userId != $uid"
            :class="
              contentbody.userId == $uid ? 'displayImgRight ' : 'displayImgLeft'
            "
            :style="{ opacity: calculateShowImgAvatar(index) ? 1 : 0 }"
            :src="users[contentbody.userId].avatar || '/icons/user.png'"
          />
          <v-card
            :class="contentbody.userId == $uid ? 'cardMesRight' : 'cardMesLeft'"
            outlined
            class="elevation-0"
          >
            <v-card-title class="cardMesTitle" v-html="contentbody.content" />
            <v-card-subtitle
              class="cardMesSub"
              v-if="calculateShowHourStr(index)"
              :class="{ rightText: contentbody.userId == $uid }"
            >
              {{ formatHour(contentbody.time) }}
            </v-card-subtitle>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Keyboard } from "@capacitor/keyboard";
import moment from "moment";

export default {
  props: ["messages", "users"],
  watch: {
    messages: {
      immediate: true,
      async handler() {
        await this.sleep(50);
        this.scrollToBottom();
      },
    },
  },
  async mounted() {
    if (this.isNative) {
      Keyboard.addListener("keyboardDidShow", (info) => {
        console.log("keyboard did show with height:", info.keyboardHeight);
        this.scrollToBottom();
      });
    }
    // this.scrollToBottom();
    console.log("mounted");
    await this.sleep(50);
    this.scrollToBottom();
  },

  data() {
    return {};
  },
  methods: {
    formatHour(str) {
      if (!str) return "";
      return moment(str).format("HH:mm");
    },
    formatDate(str) {
      if (!str) return "";
      return moment(str).format("DD/MM/YYYY");
    },
    calculateShowHourStr(index) {
      if (!this.messages) return false;
      var messages = Object.values(this.messages);
      if (messages.length == 1) return true;
      var prevMess = messages[index - 1];
      var thisMess = messages[index];
      if (!prevMess || !prevMess.time) return true;
      var duration = moment
        .duration(moment(thisMess.time).diff(moment(prevMess.time)))
        .asMinutes();
      if (duration > 5) return true;
      return false;
    },
    calculateShowImgAvatar(index) {
      if (!this.messages) return false;
      var messages = Object.values(this.messages);
      var thisMess = messages[index] || {};
      var nextMess = messages[index + 1] || {};
      if (thisMess.userId != nextMess.userId) return true;
      return false;
    },
    calculateShowChipDate(index) {
      if (!this.messages) return false;
      var messages = Object.values(this.messages);
      if (messages.length == 1) return true;
      var prevMess = messages[index - 1];
      var thisMess = messages[index];
      if (!prevMess || !prevMess.time) return true;
      return moment(thisMess.time).format("DD/MM") !=
        moment(prevMess.time).format("DD/MM")
        ? true
        : false;
    },
    scrollToBottom() {
      document.getElementById("setViewBottom").scrollIntoView(false);
    },
  },
};
</script>

<style lang="scss"></style>
