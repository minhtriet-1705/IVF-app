const state = {
  diaglog: {
    state: false,
    title: "Detail",
  },
  networkStatus: false,
  callPhoneStr: "",
  messagePhoneStr: "",
  subscriptions: [],
  viewMedicine: null,
};

const getters = {
  diaglogState(state) {
    return state.diaglog.state;
  },
  diaglogTitle(state) {
    return state.diaglog.title;
  },
  getNetworkStatus(state) {
    return state.networkStatus;
  },
  getCallPhoneStr(state) {
    return state.callPhoneStr;
  },
  getMessagePhoneStr(state) {
    return state.messagePhoneStr;
  },
  getSubscriptions() {
    return state.subscriptions;
  },
  getViewMedicine() {
    return state.viewMedicine;
  },
};

const mutations = {
  SET_VIEW_MEDICINE(state, payload) {
    state.viewMedicine = payload;
  },
  SET_DIAGLOG_STATE(state, payload) {
    state.diaglog.state = payload;
  },
  SET_DIAGLOG_TITLE(state, payload) {
    state.diaglog.title = payload;
  },
  SET_NETWORK_STATUS(state, payload) {
    state.networkStatus = payload;
  },
  SET_CALL_PHONE_STRING(state, payload) {
    state.callPhoneStr = payload;
  },
  SET_MESSAGE_PHONE_STRING(state, payload) {
    state.messagePhoneStr = payload;
  },
  SET_SUBSCRIPTIONS(state, payload) {
    state.subscriptions = payload;
  },
};

export default {
  namespaced: "Mobile",
  state,
  mutations,
  getters,
};
