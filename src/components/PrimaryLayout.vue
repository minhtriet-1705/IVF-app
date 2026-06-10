<template>
  <backdrop-blur>
    <div class="primary_layout">
      <header-navigation />
      <bottom-navigation />
      <page-content>
        <template v-slot:main>
          <v-row
            justify="center"
            align="center"
            style="height: calc(100vh - 160px); margin-top: -20px"
          >
            <v-col class="main_container" style="max-width: 664px">
              <v-container fill-height class="pa-1">
                <router-view></router-view>
              </v-container>
            </v-col>
          </v-row>
        </template>
      </page-content>
    </div>
  </backdrop-blur>
</template>

<script>
import BackdropBlur from "./BackdropBlur.vue";
import BottomNavigation from "./navigation/bottomNavigation.vue";
import HeaderNavigation from "./navigation/NavigationMobile";
import PageContent from "@/components/PageContent";

export default {
  name: "PrimaryLayout",
  components: {
    HeaderNavigation,
    BackdropBlur,
    BottomNavigation,
    PageContent,
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss">
@import "./primaryLayout.scss";
</style>
