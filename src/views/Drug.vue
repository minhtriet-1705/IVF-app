<template>
  <v-container class="ma-0 pa-1 text-center">
    <lottie-loader :url="'/lottie/drug.json'" :width="'180px'" class="mb-2" />
    <drug-list ref="DrugList" class="mb-1" :editable="true" />
  </v-container>
</template>

<script>
import LottieLoader from "@/components/LottieLoader.vue";
import DrugList from "@/components/drug/DrugList.vue";

export default {
  components: { LottieLoader, DrugList },
  computed: {},
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped lang="scss"></style>
