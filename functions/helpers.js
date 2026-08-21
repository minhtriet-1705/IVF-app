const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

const DB_PREFIX = "myivf";
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh, no DST

function ref(path) {
  return admin.database().ref(`${DB_PREFIX}/${path}`);
}

function withCors(handler) {
  return (req, res) => cors(req, res, () => handler(req, res));
}

async function getUidForPhone(phone) {
  if (!phone) return null;
  const snap = await ref(`patients/${phone}/id`).get();
  return snap.exists() ? snap.val() : null;
}

async function getTokensForUid(uid) {
  if (!uid) return [];
  const snap = await ref(`deviceToken/${uid}`).get();
  if (!snap.exists()) return [];
  return Object.keys(snap.val() || {});
}

async function sendPushToPhone(phone, title, body, data = {}) {
  try {
    const uid = await getUidForPhone(phone);
    if (!uid) return;
    const tokens = await getTokensForUid(uid);
    if (!tokens.length) return;

    const resp = await admin.messaging().sendEachForMulticast({
      notification: { title, body },
      data,
      tokens,
    });

    const invalidTokens = [];
    resp.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error && r.error.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[i]);
        }
      }
    });
    await Promise.all(
      invalidTokens.map((t) => ref(`deviceToken/${uid}/${t}`).remove())
    );
  } catch (err) {
    console.error(`sendPushToPhone failed for phone ${phone}`, err);
  }
}

async function sendPushToPhones(phones = [], title, body, data = {}) {
  const uniquePhones = [...new Set((phones || []).filter(Boolean))];
  await Promise.all(
    uniquePhones.map((phone) => sendPushToPhone(phone, title, body, data))
  );
}

function nowInVietnam() {
  return new Date(Date.now() + VN_OFFSET_MS);
}

function dateKeyVN(vnDate) {
  const y = vnDate.getUTCFullYear();
  const m = String(vnDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(vnDate.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function scheduledDateUtc(dateKey, hour, minute) {
  const y = Number(dateKey.slice(0, 4));
  const m = Number(dateKey.slice(4, 6)) - 1;
  const d = Number(dateKey.slice(6, 8));
  const vnAsUtc = Date.UTC(y, m, d, hour, minute, 0);
  return new Date(vnAsUtc - VN_OFFSET_MS);
}

module.exports = {
  DB_PREFIX,
  ref,
  withCors,
  getUidForPhone,
  getTokensForUid,
  sendPushToPhone,
  sendPushToPhones,
  nowInVietnam,
  dateKeyVN,
  scheduledDateUtc,
};
