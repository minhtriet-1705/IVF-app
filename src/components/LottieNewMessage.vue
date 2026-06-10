<template>
  <v-badge
    color="error"
    overlap
    style="z-index: 5"
    offset-x="5"
    offset-y="-10"
    dot
    v-if="isShow"
  >
  </v-badge>
</template>

<script>
export default {
  props: {
    phone: {
      type: String,
      default: "",
    },
  },
  computed: {},
  data() {
    return {
      cid: "",
      isShow: false,
    };
  },
  async created() {
    // this.renderConversationId();
  },
  async mounted() {
    await this.renderConversationId(this.phone);
    await this.listeningHasNewMessage();
  },
  methods: {
    async renderConversationId(paramPhone) {
      if (!this.phone) return;
      var userObj = await this.$dbGet(`patients/${paramPhone}`);
      if (!userObj) return this.showErrorPopup("User does exist!");
      var { id } = userObj;
      // if (!id) return this.showErrorPopup("User account is not activated yet!");
      if (!id) return;
      let userId = id;
      if (userId == this.$uid) return;

      // Check conversation ID
      let cid =
        this.$uid.localeCompare(userId) == -1
          ? this.$uid + "-" + userId
          : userId + "-" + this.$uid;
      this.cid = cid;
    },
    async listeningHasNewMessage() {
      this.$dbWatcher(
        `conversations/${this.cid}/users/${this.$uid}/hasNewMessage`,
        async (hasNewMessage) => {
          this.isShow = hasNewMessage || false;
        }
      );
    },
  },
};
</script>
