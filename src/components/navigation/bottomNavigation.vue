<template>
  <v-bottom-navigation
    class="bottom_navigation_drawer d-print-none"
    fixed
    grow
    height="56"
    width="768"
    v-if="!getIsMeasuring"
    dark
  >
    <v-btn
      v-for="item in routes"
      :key="item.title"
      :to="item.to"
      :style="{ width: 100 / routes.length + '% !important' }"
      exact
    >
      <span class="text-capitalize">{{
        $t(`nav.${item.title.toLowerCase()}`)
      }}</span>
      <v-icon>{{ item.icon }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
import { mapGetters } from "vuex";
import ListRouteView from "./routesView";
export default {
  computed: {
    ...mapGetters("Scanner", ["getIsMeasuring"]),
  },
  data: function () {
    return {
      routes: ListRouteView,
    };
  },
};
</script>

<style lang="scss">
.bottom_navigation_drawer {
  .v-btn .v-btn__content {
    font-size: 0.8rem;
  }
}
</style>
