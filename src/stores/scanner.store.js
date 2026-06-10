import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/plugins/helpers";

const getStoredBleDevices = () => {
  var devicesStr = getLocalStorage("BLE_APP_BLE_DEVICES");
  if (!devicesStr) {
    return [];
  }
  return JSON.parse(devicesStr);
};

const saveStoredBleDevices = (devices = []) => {
  setLocalStorage("BLE_APP_BLE_DEVICES", JSON.stringify(devices));
  return true;
};

const saveCurrentEpisode = (episode = {}) => {
  setLocalStorage("BLE_APP_CURRENT_EPISODE", JSON.stringify(episode));
  return true;
};

const getCurrentEpisode = () => {
  var str = getLocalStorage("BLE_APP_CURRENT_EPISODE");
  if (!str) return null;
  return JSON.parse(str);
};

const removeCurrentEpisode = () => {
  removeLocalStorage("BLE_APP_CURRENT_EPISODE");
  return true;
};

const state = {
  isMeasuring: false,
  showRequestDevice: false,
  showScanner: false,
  scannedDeviceId: null,
  scannedPhoneNumber: null,
  bleDevices: getStoredBleDevices(),
  currentEpisode: getCurrentEpisode(),
};

const getters = {
  getIsMeasuring(state) {
    return state.isMeasuring;
  },
  getShowRequestDevice(state) {
    return state.showRequestDevice;
  },
  getShowScanner(state) {
    return state.showScanner;
  },
  getCurrentEpisode(state) {
    return state.currentEpisode;
  },
  getBleDevices(state) {
    return state.bleDevices;
  },
  getScannedDeviceId(state) {
    return state.scannedDeviceId;
  },
  getScannedPhoneNumber(state) {
    return state.scannedPhoneNumber;
  },
};

const mutations = {
  SET_IS_MEASURING(state, payload) {
    state.isMeasuring = payload;
  },
  SET_SCANNED_DEVICE_ID(state, payload) {
    state.scannedDeviceId = payload;
  },
  SET_SCANNED_PHONE_NUMBER(state, payload) {
    state.scannedPhoneNumber = payload;
  },
  ADD_BLE_DEVICE(state, payload) {
    if (!payload || !payload.deviceId) return;
    // If device already added then nothing happen
    if (state.bleDevices.find((d) => d.deviceId == payload.deviceId)) {
      return;
    }
    state.bleDevices.push(payload);
    saveStoredBleDevices(state.bleDevices);
  },
  CLEAN_BLE_DEVICES(state) {
    state.bleDevices = [];
    saveStoredBleDevices(state.bleDevices);
  },
  REMOVE_BLE_DEVICE(state, payload) {
    var deviceName = payload;
    var devices = state.bleDevices.filter((d) => d.deviceName != deviceName);
    state.bleDevices = devices;
    saveStoredBleDevices(state.bleDevices);
  },
  SAVE_CURRENT_EPISODE(state, payload) {
    if (!payload) return;
    state.currentEpisode = payload;
    saveCurrentEpisode(state.currentEpisode);
  },
  REMOVE_CURRENT_EPISODE(state) {
    state.currentEpisode = null;
    removeCurrentEpisode();
  },
  OPEN_SCANNER() {
    state.showScanner = true;
  },
  CLOSE_SCANNER() {
    state.showScanner = false;
  },
  OPEN_BLE_REQUEST() {
    state.showRequestDevice = true;
  },
  CLOSE_BLE_REQUEST() {
    state.showRequestDevice = false;
  },
};

export default {
  namespaced: "Scanner",
  state,
  mutations,
  getters,
};
