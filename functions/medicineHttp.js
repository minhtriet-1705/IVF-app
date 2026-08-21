const functions = require("firebase-functions");
const { ref, withCors, sendPushToPhones } = require("./helpers");

function getMedicineId(req) {
  return (req.query && req.query.medicineId) || (req.body && req.body.medicineId);
}

async function fanOutParticipants(req, res, { notificationBody, type }) {
  try {
    const medicineId = getMedicineId(req);
    if (!medicineId) {
      return res.status(400).json({ error: "medicineId is required" });
    }
    const snap = await ref(`medicines/${medicineId}`).get();
    const medicine = snap.val();
    if (!medicine) {
      return res.status(404).json({ error: "medicine not found" });
    }

    const phones = [...(medicine.participants || []), ...(medicine.observers || [])];
    await Promise.all(
      phones.map((phone) =>
        ref(`patients/${phone}/medicinesInProgress/${medicineId}`).set(true)
      )
    );

    await sendPushToPhones(
      phones,
      medicine.medicineName || "Nhắc nhở uống thuốc",
      notificationBody,
      { medicineId, type }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("fanOutParticipants error", err);
    return res.status(500).json({ error: err.message });
  }
}

exports.ivf_notifyMedicineParticipants = functions.https.onRequest(
  withCors((req, res) =>
    fanOutParticipants(req, res, {
      notificationBody: "Bạn đã được thêm vào một lịch nhắc thuốc mới",
      type: "medicine_added",
    })
  )
);

exports.ivf_notifyMedicineUpdated = functions.https.onRequest(
  withCors((req, res) =>
    fanOutParticipants(req, res, {
      notificationBody: "Lịch nhắc thuốc vừa được cập nhật",
      type: "medicine_updated",
    })
  )
);

exports.ivf_notifyMedicineCompleted = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const medicineId = getMedicineId(req);
      if (!medicineId) {
        return res.status(400).json({ error: "medicineId is required" });
      }
      const snap = await ref(`medicines/${medicineId}`).get();
      const medicine = snap.val();
      if (!medicine) {
        return res.status(404).json({ error: "medicine not found" });
      }

      await ref(`medicines/${medicineId}/isActive`).set(false);
      await ref(`medicinesInProgress/${medicineId}`).remove();

      const phones = medicine.participants || [];
      await Promise.all(
        phones.map(async (phone) => {
          await ref(`patients/${phone}/medicinesInProgress/${medicineId}`).remove();
          await ref(`patients/${phone}/medicines/${medicineId}`).set(true);
        })
      );

      await sendPushToPhones(
        phones,
        medicine.medicineName || "Nhắc nhở uống thuốc",
        "Lịch nhắc thuốc đã hoàn thành",
        { medicineId, type: "medicine_completed" }
      );

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("ivf_notifyMedicineCompleted error", err);
      return res.status(500).json({ error: err.message });
    }
  })
);

async function handleParticipantRemoval(req, res) {
  try {
    const { medicineId, phoneCancelled } = req.body || {};
    if (!medicineId || !phoneCancelled) {
      return res
        .status(400)
        .json({ error: "medicineId and phoneCancelled are required" });
    }
    const snap = await ref(`medicines/${medicineId}`).get();
    const medicine = snap.val();
    if (!medicine) {
      return res.status(404).json({ error: "medicine not found" });
    }

    const remainingParticipants = (medicine.participants || []).filter(
      (p) => p !== phoneCancelled
    );
    await ref(`medicines/${medicineId}/participants`).set(remainingParticipants);
    await ref(`patients/${phoneCancelled}/medicinesInProgress/${medicineId}`).remove();

    await sendPushToPhones(
      remainingParticipants,
      medicine.medicineName || "Nhắc nhở uống thuốc",
      "Một thành viên đã rời khỏi lịch nhắc thuốc",
      { medicineId, type: "participant_removed" }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("handleParticipantRemoval error", err);
    return res.status(500).json({ error: err.message });
  }
}

exports.ivf_notifyUserCancel = functions.https.onRequest(
  withCors(handleParticipantRemoval)
);
exports.ivf_notifyCancelUser = functions.https.onRequest(
  withCors(handleParticipantRemoval)
);

exports.ivf_notifyAction = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { actionId, phone, actionType, ContentDetail } = req.body || {};
      if (!actionId || !phone || !actionType) {
        return res
          .status(400)
          .json({ error: "actionId, phone and actionType are required" });
      }
      const medicineId = actionId.split("___")[0];
      if (!medicineId) {
        return res.status(400).json({ error: "invalid actionId" });
      }

      const status = actionType === "done" ? "done" : "cancelled";
      await ref(`actions/${medicineId}/${actionId}`).update({
        StatusAction: status,
        ContentDetail: ContentDetail || "",
      });
      await ref(`patients/${phone}/actionsInProgress/${actionId}`).remove();

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("ivf_notifyAction error", err);
      return res.status(500).json({ error: err.message });
    }
  })
);
