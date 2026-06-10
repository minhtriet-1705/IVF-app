<template>
  <div>
    <v-dialog eager v-model="isShow" max-width="620">
      <v-card class="ChatBoxContainer grey">
        <Header
          :conversationId="cid"
          :receiver="receiver"
          :remoteUserPhone="remoteUserPhone"
          @close-boxchat="onClickCloseChatBox"
          ref="ChatBoxHeader"
        />
        <v-card-text class="bodyChatBox">
          <v-container class="overflow-y-auto hContainer">
            <BodyChatBox
              id="setViewBottom"
              :messages="conversation.messages"
              :users="conversation.users"
            />
          </v-container>
        </v-card-text>
        <Footer @send-message="sendMessage" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import { mapGetters } from "vuex";
import BodyChatBox from "./chatbox/Body.vue";
import Header from "./chatbox/Header.vue";
import Footer from "./chatbox/Footer.vue";

export default {
  components: {
    BodyChatBox,
    Header,
    Footer,
  },
  computed: {
    ...mapGetters("Mobile", ["getMessagePhoneStr"]),
  },
  watch: {
    getMessagePhoneStr: {
      async handler(newValue, oldValue) {
        if (newValue && newValue != oldValue) {
          this.remoteUserPhone = newValue;
          await this.onClickOpenChatBox(newValue);
        }
      },
    },
    isShow(val) {
      if (!val) {
        this.updateOnlineStatus(false);
      }
    },
  },
  data() {
    return {
      cid: "",
      isBellOff: false,
      messageContent: "",
      isShow: false,
      opusRecorder: null,
      samplingRate: 48000,
      lang: "en-US",
      loading: true,
      items: [],
      conversation: { messages: {}, users: {} },
      sender: {},
      receiver: {},
      remoteUserPhone: "",
    };
  },
  async created() {},
  async mounted() {
    window.addEventListener("beforeunload", () =>
      this.updateOnlineStatus(false)
    );
  },
  methods: {
    async onClickCloseChatBox() {
      this.isShow = false;
      this.updateOnlineStatus(false);
    },
    async onClickOpenChatBox(paramPhone) {
      await this.renderConversation(paramPhone);
      await this.checkSenderAndReceiver();
      this.updateOnlineStatus(true);
      this.$refs.ChatBoxHeader.getBellStatus();
      this.listeningNewMessage();
      this.isShow = true;
    },
    async updateOnlineStatus(status = false) {
      if (!this.cid || !this.receiver) return;
      await this.$dbSet(
        `conversations/${this.cid}/users/${this.$uid}/onlineStatus`,
        status
      );
      if (!status) {
        await this.$dbSet(
          `conversations/${this.cid}/users/${this.$uid}/lastOnline`,
          moment().format()
        );
      } else {
        await this.$dbSet(
          `conversations/${this.cid}/users/${this.$uid}/hasNewMessage`,
          false
        );
      }
    },
    async getUserInfo(userId = "") {
      if (!userId) return null;
      var userInfo = await this.$dbGet(`users/${userId}`);
      return {
        userId,
        fullName: userInfo.fullName,
        avatar: userInfo.avatar || "/icons/user.png",
        onlineStatus: false,
        lastOnline: moment().format(),
      };
    },
    async checkSenderAndReceiver() {
      var users = Object.values(this.conversation.users);
      users.forEach((user) => {
        if (user.userId == this.$uid) {
          this.sender = user;
        } else {
          this.receiver = user;
        }
      });
    },
    async renderConversation(paramPhone = "") {
      this.$store.commit("Mobile/SET_MESSAGE_PHONE_STRING", null);
      if (!paramPhone) return this.showErrorPopup("Phone number is missing!");
      var userObj = await this.$dbGet(`patients/${paramPhone}`);
      if (!userObj) return this.showErrorPopup("User does exist!");
      var { id } = userObj;
      // if (!id) return this.showErrorPopup("User account is not activated yet!");
      if (!id) return;
      let userId = id;
      // Check conversation ID
      let cid =
        this.$uid.localeCompare(userId) == -1
          ? this.$uid + "-" + userId
          : userId + "-" + this.$uid;
      this.cid = cid;
      let conversation = await this.$dbGet(`conversations/${cid}`);

      if (!conversation) {
        conversation = {
          conversationId: cid,
          messages: {},
          users: {},
        };
        conversation.users[this.$uid] = await this.getUserInfo(this.$uid);
        conversation.users[userId] = await this.getUserInfo(userId);

        await this.$dbSet(`conversations/${cid}`, conversation);
      }
      this.conversation = conversation;
    },
    async sendMessage(messageContent = "") {
      if (!messageContent) return;
      var messageId = `${moment().format()}-${this.$uid}`;
      //Create message object
      let message = {
        userId: this.$uid,
        content: messageContent,
        time: moment().format(),
        messageId,
      };
      //Add new message in Conversations database
      await this.$dbSet(
        `conversations/${this.cid}/messages/${messageId}`,
        message
      );
      await this.notifyReceiverHasNewMessage(messageContent);
    },
    async notifyReceiverHasNewMessage(messageContent = "") {
      if (!this.receiver) return;
      var isReceiverOnline = await this.$dbGet(
        `conversations/${this.cid}/users/${this.receiver.userId}/onlineStatus`
      );
      if (!isReceiverOnline) {
        await this.$dbSet(
          `conversations/${this.cid}/users/${this.receiver.userId}/hasNewMessage`,
          true
        );
        await this.pushNotificationReceiverHasNewMessage(messageContent);
      }
    },
    async pushNotificationReceiverHasNewMessage(messageContent = "") {
      if (!this.networkStatus) return;
      var senderId = this.sender.userId;
      var receiverId = this.receiver.userId;

      var payload = { senderId, receiverId, content: messageContent };
      var resp = await axios.post(
        "https://us-central1-sandrasoft-8fe2b.cloudfunctions.net/notifyNewMessages",
        payload
      );
      console.log(resp.data);
    },
    async listeningNewMessage() {
      this.$dbWatcher(
        `conversations/${this.cid}/messages`,
        async (newMessageObj) => {
          this.conversation.messages = newMessageObj;
          this.$forceUpdate();
        }
      );
    },
    capitalizeFirstLetter(string) {
      string = string.trim();
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
  },
};
</script>

<style lang="scss">
.ChatBoxContainer {
  overflow-x: none;
  .iconHeader {
    color: white !important;
  }
  .chatInp {
    // background-color: white;
    border-radius: 18px !important;
    // width: 100%;
    // margin-top: 15px !important;
    input {
      padding: 0 5px !important;
      word-wrap: initial;
      font-size: 0.9rem;
    }
  }
  .bodyChatBox {
    height: calc(60vh - 20px);
    // background-color: #b0bec5;
    padding: 0 !important;
    overflow-x: hidden;
    overflow-y: scroll;
    img {
      object-fit: cover;
    }
  }
  .v-card {
    box-shadow: none;
    width: 40vw;
    margin: 0 auto;
    @media screen and (max-width: 415px) {
      width: 90vw;
    }
    @media screen and (max-width: 915px) and (min-width: 420px) {
      width: 70vw;
    }
  }
  .headerChatbox {
    text-align: center;
    height: auto;
    padding: 10px 5px 10px 10px !important;
    color: white;
    img {
      object-fit: cover;
    }
  }
  .userNameRemode {
    text-align: start;
  }
  .headericon {
    text-align: end;
  }
  .bottomChatBot {
    height: 75px;
  }
  .iconSend {
    color: #2196f3 !important;
    // transform: translate(-100%, 0%);
    font-size: 30px !important;
  }
  .iconMicro {
    color: #2196f3 !important;
    font-size: 30px !important;
  }
  .btnMicrophone {
    height: 56px !important;
    width: 56px !important;
    background-color: white;
  }
  .chatInp > div {
    background-color: white !important;
  }
  .p0 {
    padding: 0 !important;
  }
  .colMicro {
    padding-left: 0 !important;
    display: flex;
    justify-content: center;
  }
  .cardHeader {
    border-radius: 20px !important;
  }
  .btnCloseChatBox {
    color: #2196f3 !important;
    box-shadow: none;
    border: none !important;
  }
  .mdi-close {
    font-size: 2rem !important;
  }
  .containerMesRight {
    display: flex;
    justify-content: right;
    padding: 3px 0;
  }
  .containerMesLeft {
    display: flex;
    justify-content: left;
    padding: 3px 0;
  }
  .container2Mes {
    margin-right: 0;
    max-width: 80%;
    display: flex;
    align-items: flex-end;
  }
  .cardMesRight {
    border-radius: 9px;
    width: auto;
    height: auto;
    border: none;
    padding: 8px 10px;
    min-width: 60px;
  }
  .cardMesLeft {
    border-radius: 9px;
    width: auto;
    height: auto;
    border: none;
    padding: 8px 10px;
    min-width: 60px;
  }
  .displayImgRight {
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    transform: translate(10%, 0%);
    // @media screen and (max-width: 600px) {
    //   display: none;
    // }
  }
  .displayImgLeft {
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    transform: translate(-10%, 0%);
    // @media screen and (max-width: 600px) {
    //   display: none;
    // }
  }
  .cardMesTitle {
    font-size: 0.89rem;
    font-weight: 400;
    line-height: 1.15rem;
    // padding: 0 0 18px !important;
    padding: 0 !important;
    letter-spacing: 0px;
    word-break: normal;
  }
  .cardMesSub {
    font-size: 0.6rem;
    padding: 0 !important;
    text-align: left;
    width: 100%;
    display: block;
    margin-top: 0px;
    opacity: 0.7;
    line-height: 0.9rem;
  }
  .rightText {
    text-align: right;
  }
}
.ChatBoxContainer.ChatBoxNativeUI {
  .headerChatbox {
    height: 70px;
    position: fixed;
    width: 100vw;
    top: 0px;
    border-radius: 0px !important;
    padding-top: 15px !important;
    z-index: 2;
  }
  .bodyChatBox {
    position: fixed;
    height: calc(100vh - 140px);
    bottom: 70px;
  }
  .bottomChatBot {
    background-color: #b0bec5;
    height: 70px;
    position: fixed;
    width: 100vw;
    bottom: 0px;
    border-radius: 0px !important;
  }
}
</style>
