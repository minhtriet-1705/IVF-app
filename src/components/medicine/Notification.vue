<template>
  <v-dialog
    v-model="isShow"
    fullscreen
    transition="dialog-bottom-transition"
    eager
  >
    <v-card class="custom grey">
      <div style="max-width: 700px; margin: 0px auto 0 auto">
        <v-btn
          @click="
            isShow = false;
            resolve(false);
          "
          class="btn_close mt-5"
          elevation="0"
          fixed
          style="z-index: 10"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-text>
          <v-card-title class="pt-5">{{
            $t("home.notification")
          }}</v-card-title>
          <div style="text-align: center" v-if="loading">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
          <div class="content_card patient_list notification" v-else>
            <h5 v-if="!items.length" class="no_data ml-4">
              {{ $t("common.nodata") }}
            </h5>

            <content-item
              v-for="(item, index) in items"
              :key="index"
              :item="item"
              @view="viewMedicine(item)"
              class="contact_item smallText whiteBg"
              :class="{ isRead: item.StatusAction != 'waiting' }"
            >
            </content-item>
          </div>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import ContentItem from "@/components/cards/ContentItem";
import moment from "moment";

export default {
  components: { ContentItem },
  data() {
    return {
      loading: false,
      isShow: false,
      resolve: null,
      items: [],
    };
  },
  async mounted() {
    this.render();
  },
  methods: {
    async open() {
      this.isShow = true;
      return new Promise((resolve) => {
        this.render();
        this.resolve = resolve;
      });
    },
    async getDetail(actionId) {
      if (!actionId) return null;
      var medicineId = actionId.split("___")[0];
      if (!medicineId) return null;
      var action = await this.$dbGet(`actions/${medicineId}/${actionId}`);
      return action || null;
    },
    async viewMedicine({ medicineId, actionId }) {
      this.isShow = false;
      await this.updateActionIsRead(actionId);
      this.$store.commit("Mobile/SET_VIEW_MEDICINE", medicineId);
      await this.sleep(100);
      this.$router.push(`/medicine/${medicineId}?tab=2`);
    },
    async updateActionIsRead(actionId) {
      var medicineId = actionId.split("___")[0];
      await this.$dbSet(
        `actions/${medicineId}/${actionId}/StatusAction`,
        "read"
      );
    },
    async render() {
      this.loading = true;
      var actionObj = await this.$dbGet(`patients/${this.$phone}/actions`);
      if (!actionObj) {
        this.items = [];
        this.loading = false;
        return;
      }
      var actionIds = Object.keys(actionObj).slice(0, 20);
      var promises = [];
      actionIds.forEach((id) => promises.push(this.getDetail(id)));
      Promise.all(promises)
        .then(async (values) => {
          values = values
            ? values
                .filter((p) => !!p)
                .sort(
                  (a, b) =>
                    moment(b.dateCreated).valueOf() -
                    moment(a.dateCreated).valueOf()
                )
            : [];
          this.loading = false;
          this.items = values
            .map((p) => {
              return {
                ...p,
                image: this.getNotificationIcon(p.notification),
                isShow: this.getNotificationFilter(p.notification),
                title: `<b>${
                  (p.notification && p.notification.title) ||
                  (p.medicine && p.medicine.medicineName)
                }</b>`,
                freeContent: `<span>${
                  p.notification && p.notification.body
                }</span>`,
                message: `<span style='font-size:0.8rem;'>${moment(
                  p.dateCreated
                ).format("HH:mm")} ${this.$t("common.date")} ${moment(
                  p.dateCreated
                ).format("DD/MM/YYYY")}</span>`,
                iconbel: true,
              };
            })
            .filter((p) => p.isShow);
        })
        .catch((err) => console.error(err));
    },
    save() {
      this.resolve(true);
      this.isShow = false;
    },
    cancel() {
      this.resolve(false);
      this.isShow = false;
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
