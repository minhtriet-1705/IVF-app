export const GenderType = {
  Male: 1,
  Female: 2,
};

export const QueueStatus = {
  Active: 0,
  Success: 1,
  Deleted: -1,
};

export const BleSeverity = {
  Severe: 1,
  High: 2,
  Normal: 3,
  Low: 4,
};

export const EventName = {
  onDatapointReceived: "onDatapointReceived",
  onEpisodeDatapoints: "onEpisodeDatapoints",
  onEpisodeFinished: "onEpisodeFinished",
};

export const MedicineType = {
  Swallow: 1,
  Inhale: 2,
  Inject: 3,
};

export const MedicineUnit = {
  Capsule: 1,
  Tuyp: 2,
  Bottle: 3,
  Tablet: 4,
  Box: 5,
  Tube: 6,
};

export const RepeatTypeNames = [
  "norepeat",
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export const ActionType = {
  notify: "notify",
  request: "request",
  todo: "todo",
  done: "done",
  cancel: "cancel",
  missed: "missed",
};

export const ActionStatus = {
  waiting: "waiting",
  success: "success",
  failed: "failed",
};
