<template>
  <v-container class="ma-0 pa-1 text-center pt-5">
    <v-tabs v-model="tab" fixed-tabs class="tab_medicine mt-3">
      <v-tab @click="scrollToTop" href="#mobile-tabs-1">
        {{ $t("common.information") }}
      </v-tab>
      <v-tab @click="scrollToTop" href="#mobile-tabs-2">
        {{ $t("common.history") }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" touchless>
      <v-tab-item :value="'mobile-tabs-' + 1" :eager="true">
        <medicine-detail class="mt-10" />
      </v-tab-item>
      <v-tab-item :value="'mobile-tabs-' + 2" :eager="true">
        <medicine-actions :medicineId="$route.params.id" />
      </v-tab-item>
    </v-tabs-items>
    <v-btn
      icon
      style="top: 85px; z-index: 50; left: 62px; position: absolute"
      @click="back"
    >
      <v-icon large color="black" class="pa-5">mdi-arrow-left</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import MedicineDetail from "@/components/medicine/MedicineDetail.vue";
import MedicineActions from "@/components/medicine/MedicineActions.vue";
export default {
  components: { MedicineDetail, MedicineActions },
  computed: {},
  data() {
    return {
      tab: 1,
    };
  },
  mounted() {
    if (this.$route.query.tab) {
      this.tab = `mobile-tabs-${this.$route.query.tab}`;
    }
  },
  methods: {
    scrollToTop() {
      window.scrollTo(0, 0);
    },
  },
};
</script>
