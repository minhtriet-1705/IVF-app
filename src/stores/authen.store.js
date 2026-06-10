import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/plugins/helpers";
import { GenderType } from "../plugins/constants";

function getStoredUser() {
  var userStr = getLocalStorage("BLE_APP_USER_OBJECT");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return {
    id: "",
    phone: "",
    fullName: "",
    gender: GenderType.Female,
    birthDate: "",
    profileID: "",
  };
}

const state = {
  doctorInCharge: {
    phone: "",
    fullName: "",
  },
  user: getStoredUser(),
};

const getters = {
  getUser(state) {
    return state.user;
  },
  doctorInCharge(state) {
    return state.doctorInCharge;
  },
  isAuthenticated(state) {
    return (state.user.id && state.user.phone && state.user.fullName) || false;
  },
};

const mutations = {
  SET_USER_PROFILE(state, payload) {
    state.user = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_ID(state, payload) {
    state.user.id = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_PHONE(state, payload) {
    state.user.phone = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_FULLNAME(state, payload) {
    state.user.fullName = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_GENDER(state, payload) {
    state.user.gender = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_BIRTHDATE(state, payload) {
    state.user.birthDate = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_PROFILEID(state, payload) {
    state.user.profileID = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  SET_DOCTOR_IN_CHARGE(state, payload) {
    state.doctorInCharge = payload;
  },
  SET_USER(state, payload) {
    state.user = payload;
    var strUser = JSON.stringify(state.user);
    setLocalStorage("BLE_APP_USER_OBJECT", strUser);
  },
  LOGOUT(state) {
    removeLocalStorage("BLE_APP_USER_OBJECT");
    state.user = getStoredUser();
  },
};

export default {
  namespaced: "Authen",
  state,
  mutations,
  getters,
};
