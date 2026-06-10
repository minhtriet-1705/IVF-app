<template>
  <div style="align-items: center" class="bottomChatBot d-flex grey">
    <v-form @submit.prevent="sendMessage" style="width: 100%">
      <v-text-field
        class="chatInp ml-3 mr-3"
        outlined
        hide-details
        placeholder="Tin nhắn"
        v-model="messageContent"
        color="primary"
      ></v-text-field>
    </v-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messageContent: "",
    };
  },
  mounted() {},
  methods: {
    sendMessage() {
      this.$emit("send-message", this.messageContent);
      this.messageContent = "";
    },
  },
};
</script>

<style></style>
