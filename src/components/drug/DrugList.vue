<template>
  <div class="content_card patient_list">
    <div style="width: 100%; display: flex">
      <v-text-field
        :placeholder="$t('common.search')"
        v-model="searchText"
        clearable
        filled
        outlined
        required
        hide-details
        color="primary"
        @input="search"
      ></v-text-field>
      <v-btn
        class="text-capitalize btn_show_scanner"
        @click="$refs.PopupDrugDetail.open()"
        elevation="0"
        style="height: 55px !important; width: 140px !important"
        dark
        v-if="isAdmin"
      >
        <v-icon small class="mr-2">mdi-plus</v-icon>
        {{ $t("common.create") }}
      </v-btn>
    </div>
    <div style="text-align: center" v-if="loading" class="mt-5">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div v-else class="mb-2 mt-3">
      <div v-for="(item, index) in items" :key="index">
        <content-item
          :item="item"
          @view="editable ? edit(item.drugId) : view(item.drugId)"
          class="contact_item"
        >
          <template v-slot:controller>
            <v-list-item-icon class="pt-1 pb-1 pr-1">
              <v-btn
                @click="
                  $event.stopPropagation();
                  handleSelect(item);
                "
                fab
                dark
                icon
                elevation="0"
                color="black"
                style="background-color: #e0e0e0 !important"
                v-if="!editable"
                :style="{ width: editable ? 'auto' : '42px !important' }"
              >
                <v-icon v-if="selectedItems.includes(item.drugId)">
                  mdi-check
                </v-icon>
              </v-btn>

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
                style="
                  width: 20px !important;
                  height: 20px !important;
                  border-radius: 20px;
                "
                class="delete_btn mr-1 mt-1"
                v-if="isAdmin"
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
    <popup-drug-detail ref="PopupDrugDetail" @onCreate="onCreate" />
  </div>
</template>

<script>
import { standardizing } from "@/plugins/helpers";
import ContentItem from "@/components/cards/ContentItem";
import PopupDrugDetail from "./PopupDrugDetail.vue";
import moment from "moment";

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
    enableSelect: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    ContentItem,
    PopupDrugDetail,
  },
  watch: {
    value() {
      this.selectedItems = this.value;
    },
  },
  data() {
    return {
      loading: false,
      bin: [],
      items: [],
      selectedItems: [],
      searchText: "",
    };
  },
  async mounted() {
    this.selectedItems = this.value || [];
    this.loading = true;
    await this.render();
    this.loading = false;
  },
  methods: {
    async search() {
      if (!this.searchText) return (this.items = this.bin);
      this.items = this.bin.filter((i) =>
        standardizing(i.drugName).includes(standardizing(this.searchText))
      );
    },
    async handleSelect(item = {}) {
      if (this.enableSelect) {
        var ind = this.selectedItems.findIndex((id) => id == item.drugId);
        if (ind == -1) this.selectedItems.push(item.drugId);
        else this.selectedItems.splice(ind, 1);
      }
    },
    async view(id) {
      this.$refs.PopupDrugDetail.view(id);
    },
    async edit(id) {
      this.$refs.PopupDrugDetail.edit(id);
    },
    async onCreate() {
      await this.render();
    },
    async render() {
      var items = (await this.$dbGet(`drugs`)) || {};
      items = Object.values(items);
      this.items = items.map((p) => ({
        ...p,
        image: p.avatar || "/medicine/dropper.png",
        imageSize: 62,
        title: p.drugName,
        content: moment(p.dateCreated || "").format("HH:mm DD/MM/YYYY"),
      }));
      this.bin = JSON.parse(JSON.stringify(this.items));
    },
    async remove(id = "") {
      if (!id) return;
      if (!confirm(`${this.$t("common.removeMedicineConfirmMessage")}`)) return;
      await this.$dbSet(`drugs/${id}`, null);
      this.render();
    },
  },
};
</script>
