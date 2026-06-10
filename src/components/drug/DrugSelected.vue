<template>
  <div class="content_card">
    <h5 class="no_data mt-3 mb-3" v-if="!items.length">
      {{ $t("common.nodata") }}
    </h5>
    <div v-else class="mb-2 mt-3">
      <div v-for="(item, index) in items" :key="index">
        <content-item
          :item="item"
          @view="view(item.drugId)"
          class="contact_item"
        >
          <template v-slot:controller>
            <v-list-item-icon class="pt-1 pb-1 pr-1">
              <v-btn
                @click="
                  $event.stopPropagation();
                  remove(item.drugId);
                "
                fab
                dark
                icon
                elevation="0"
                color="black"
                class="btn_delete_drug"
                v-if="editable"
              >
                <v-icon> mdi-trash-can-outline </v-icon>
              </v-btn>
            </v-list-item-icon>
          </template>
        </content-item>
      </div>
      <h5 class="no_data" v-if="!items.length">
        {{ $t("common.nodata") }}
      </h5>
    </div>
    <v-btn
      dark
      block
      style="height: 36px !important"
      class="mt-3 text-uppercase"
      @click="$refs.PopupDrugList.open()"
      v-if="editable"
    >
      <v-icon small class="mr-1">mdi-plus</v-icon>
      {{ $t("common.add") }} {{ $t("medicine.medicine") }}
    </v-btn>
    <popup-drug-list
      ref="PopupDrugList"
      class="mb-1"
      :editable="false"
      v-model="value"
    />
    <popup-drug-detail ref="PopupDrugDetail" />
  </div>
</template>

<script>
import PopupDrugList from "./PopupDrugList.vue";
import PopupDrugDetail from "./PopupDrugDetail.vue";
import moment from "moment";
import ContentItem from "@/components/cards/ContentItem";

export default {
  props: {
    value: {
      type: Array,
      default: function () {
        return [];
      },
    },
    editable: {
      type: Boolean,
      default: function () {
        true;
      },
    },
  },
  components: { PopupDrugList, PopupDrugDetail, ContentItem },
  watch: {
    value() {
      this.render();
    },
  },
  data() {
    return {
      items: [],
    };
  },
  async mounted() {
    this.render();
  },
  methods: {
    remove(id) {
      var ind = this.items.findIndex((i) => i.drugId == id);
      if (ind != -1) this.items.splice(ind, 1);
      this.value.splice(ind, 1);
    },
    async view(id) {
      this.$refs.PopupDrugDetail.view(id);
    },
    async getDrugDetail(id = "") {
      if (!id) return null;
      return this.$dbGet(`drugs/${id}`) || null;
    },
    async render() {
      var drugs = [];
      this.value.forEach((id) => {
        drugs.push(this.getDrugDetail(id));
      });
      return new Promise((resolve) => {
        Promise.all(drugs).then((items) => {
          items = items.filter((i) => !!i);
          this.items = items.map((p) => ({
            ...p,
            image: p.avatar || "/medicine/dropper.png",
            imageSize: 62,
            title: p.drugName,
            content: moment(p.dateCreated || "").format("HH:mm DD/MM/YYYY"),
          }));
          resolve(true);
        });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.btn_delete_drug {
  background-color: #e0e0e0 !important;
  width: 42px !important;
}
</style>
