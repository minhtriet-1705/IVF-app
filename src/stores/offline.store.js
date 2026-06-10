var localStorageRecordIds = "localStorageRecordIds";

var saveEpisodeToLocalStorage = (episode) => {
  var { id } = episode;
  if (!id) return;
  localStorage.setItem(id, JSON.stringify(episode));
};

var removeEpisodeFromLocalStorage = (episodeId) => {
  localStorage.removeItem(episodeId);
};

var saveListEpisodeIdsToLocalStorage = (episodeIds = []) => {
  episodeIds = episodeIds || [];
  localStorage.setItem(localStorageRecordIds, JSON.stringify(episodeIds));
};

var getListOfflineEpisodes = () => {
  var episodeIdString = localStorage.getItem(localStorageRecordIds);
  var episodeIds = episodeIdString ? JSON.parse(episodeIdString) : [];
  var episodes = [];
  for (var episodeId of episodeIds) {
    var episodeString = localStorage.getItem(episodeId);
    if (episodeString) {
      episodes.push(JSON.parse(episodeString));
    }
  }
  return episodes;
};

const state = {
  offlineEpisodes: getListOfflineEpisodes(),
  unSyncedCounts: getListOfflineEpisodes().length,
  syncedCounts: 0,
};

const getters = {
  offlineEpisodes: (state) => {
    return state.offlineEpisodes;
  },
  offlineEpisodeDetail: (state) => (id) => {
    var episode = state.offlineEpisodes.find((ep) => ep.id == id);
    return episode || null;
  },
  unSyncedCounts: (state) => {
    return state.unSyncedCounts;
  },
  syncedCounts: (state) => {
    return state.syncedCounts;
  },
};

const mutations = {
  ADD_OFFLINE_EPISODE(state, episode) {
    state.offlineEpisodes.push(episode);
    state.unSyncedCounts += 1;
    saveEpisodeToLocalStorage(episode);
    saveListEpisodeIdsToLocalStorage(state.offlineEpisodes.map((i) => i.id));
  },
  DELETE_OFFLINE_EPISODE(state, episodeId) {
    state.offlineEpisodes = state.offlineEpisodes.filter(
      (ep) => ep.id != episodeId
    );
    removeEpisodeFromLocalStorage(episodeId);
    saveListEpisodeIdsToLocalStorage(state.offlineEpisodes.map((i) => i.id));
  },
  INCREASE_SYNCED_COUNTS(state) {
    state.syncedCounts += 1;
  },
  VALIDATE_SYNC_COUNTS(state) {
    if (state.syncedCounts == state.unSyncedCounts) {
      state.syncedCounts = 0;
      state.unSyncedCounts = 0;
    }
  },
};

export default {
  namespaced: "Offline",
  state,
  mutations,
  getters,
};
