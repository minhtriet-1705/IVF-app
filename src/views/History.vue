<template>
  <v-container class="ma-0 pa-1 text-center">
    <lottie-loader :url="'/lottie/robot.json'" :width="'220px'" class="ml-3" />
    <medicine-list
      ref="MedicineList"
      class="mb-1"
      style="margin-top: -20px !important"
    />
    <div style="position: fixed; bottom: 82px; width: 100%; max-width: 620px">
      <v-btn
        dark
        color="dark"
        rounded
        class="pa-6 mb-1"
        @click="$router.push('/medicine')"
      >
        <v-icon left> mdi-plus </v-icon>
        {{ $t("common.add") }}
        {{ $t("common.reminder") }}
      </v-btn>
      <v-btn
        dark
        small
        fab
        color="dark"
        rounded
        class="mb-1 ml-2"
        @click="$refs.MedicineList.render()"
        elevation="2"
      >
        <v-icon> mdi-refresh </v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import LottieLoader from "@/components/LottieLoader.vue";
import MedicineList from "@/components/medicine/MedicineList.vue";

export default {
  components: { LottieLoader, MedicineList },
  computed: {},
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped lang="scss"></style>
