<template>
  <div>
    <div style="text-align: center" v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div class="content_card patient_list pt-12" v-else>
      <lottie-loader
        :url="'/lottie/episode.json'"
        :width="'120px'"
        class="mt-10 ml-3"
        v-show="!items || items.length < 2"
      />
      <h5 v-if="!items.length" class="no_data ml-4">
        {{ $t("common.nodata") }}
      </h5>

      <content-item
        v-for="(item, index) in items"
        :key="index"
        :item="item"
        @view="viewItem(item)"
        class="contact_item smallText whiteBg medicine_action"
        :class="{ isRead: item.StatusAction != 'waiting' }"
      >
      </content-item>
    </div>
  </div>
</template>

<script>
import ContentItem from "@/components/cards/ContentItem";
import moment from "moment";
import LottieLoader from "@/components/LottieLoader.vue";

export default {
  props: {
    medicineId: {
      type: String,
      default: "",
    },
  },
  components: { ContentItem, LottieLoader },
  data() {
    return {
      loading: false,
      items: [],
    };
  },
  async mounted() {
    this.render();
  },
  methods: {
    async render() {
      this.loading = true;
      var actionsObj = await this.$dbGet(`actions/${this.medicineId}`);
      if (!actionsObj) {
        this.items = [];
        this.loading = false;
        return;
      }
      var actions = Object.values(actionsObj);
      // console.log(actions);
      actions = actions
        .filter((p) => !!p)
        .filter((p) => !!p.actionId)
        .sort(
          (a, b) =>
            moment(b.dateCreated).valueOf() - moment(a.dateCreated).valueOf()
        );
      this.loading = false;
      actions = this.cleanDuplicate(actions);
      var items = actions.map((p) => {
        return {
          ...p,
          image: this.getNotificationIcon(p.notification),
          isShow: this.getNotificationFilter(p.notification),
          title: `<b style='font-size:0.9rem'>${
            (p.notification && p.notification.title) ||
            (p.medicine && p.medicine.medicineName)
          }</b>`,
          freeContent2: `<span>${p.notification && p.notification.body}</span>`,
          freeContent: `<span>${p.ContentDetail}</span>`,
          message: `<span style='font-size:0.8rem;'>${moment(
            p.dateCreated
          ).format("HH:mm")} ${this.$t("common.date")} ${moment(
            p.dateCreated
          ).format("DD/MM/YYYY")}</span>`,
          iconbel: true,
        };
      });
      this.items = items.filter((i) => i.isShow);
      // this.items = items;
    },
    cleanDuplicate(actions = []) {
      var names = [];
      var result = [];
      for (var action of actions) {
        if (!names.includes(action.notification && action.notification.body)) {
          names.push(action.notification.body);
          result.push(action);
        }
      }
      return result;
    },
    async viewItem({ actionId }) {
      await this.updateActionIsRead(actionId);
      var ind = this.items.findIndex((i) => i.actionId == actionId);
      if (ind != -1) this.items[ind].StatusAction = "read";
      this.$forceUpdate();
    },
    async updateActionIsRead(actionId) {
      var [medicineId, actionId2] = actionId.split("___");
      console.log(actionId2);
      await this.$dbSet(
        `actions/${medicineId}/${actionId}/StatusAction`,
        "read"
      );
    },
  },
};
</script>

<style lang="scss">
.v-dialog {
  .v-card__text {
    font-size: 1rem;
  }
}
</style>
