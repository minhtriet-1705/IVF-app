import Vue from "vue";
import Vuex from "vuex";

import Mobile from "./mobile.store";
import Scanner from "./scanner.store";
import Authen from "./authen.store";
import Offline from "./offline.store";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    Authen,
    Mobile,
    Scanner,
    Offline,
  },
});
