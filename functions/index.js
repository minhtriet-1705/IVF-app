const admin = require("firebase-admin");

admin.initializeApp();

Object.assign(exports, require("./medicineHttp"));
Object.assign(exports, require("./reminders"));
