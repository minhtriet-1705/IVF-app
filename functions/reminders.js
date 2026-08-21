const functions = require("firebase-functions");
const {
  ref,
  sendPushToPhones,
  nowInVietnam,
  dateKeyVN,
  scheduledDateUtc,
} = require("./helpers");

const CHECK_WINDOW_MINUTES = 5;

async function sendEarlyReminderIfNeeded(medicineId, actionId, medicine, minutesLeft) {
  const markerRef = ref(`earlyReminders/${medicineId}/${actionId}`);
  const existing = await markerRef.get();
  if (existing.exists()) return;
  await markerRef.set(true);

  const phones = medicine.participants || [];
  const title = medicine.medicineName || "Sắp đến giờ uống thuốc";
  const body = `Còn ${minutesLeft} phút nữa đến giờ uống thuốc`;
  await sendPushToPhones(phones, title, body, {
    actionId,
    medicineId,
    type: "medicine_action_early",
  });
}

async function createActionIfNeeded(medicineId, actionId, medicine, dateScheduled) {
  const existing = await ref(`actions/${medicineId}/${actionId}`).get();
  if (existing.exists()) return;

  const nowIso = new Date().toISOString();
  const notification = {
    title: medicine.medicineName || "Nhắc nhở uống thuốc",
    body: medicine.message || "Đã đến giờ uống thuốc",
  };
  const action = {
    actionId,
    medicineId,
    dateScheduled: dateScheduled.toISOString(),
    dateCreated: nowIso,
    notification,
    medicine,
    StatusAction: "waiting",
  };

  await ref(`actions/${medicineId}/${actionId}`).set(action);

  const phones = medicine.participants || [];
  await Promise.all(
    phones.map(async (phone) => {
      await ref(`patients/${phone}/actionsInProgress/${actionId}`).set(true);
      await ref(`patients/${phone}/actions/${actionId}`).set(true);
    })
  );

  await sendPushToPhones(phones, notification.title, notification.body, {
    actionId,
    medicineId,
    type: "medicine_action",
  });
}

exports.checkMedicineReminders = functions.pubsub
  .schedule(`every ${CHECK_WINDOW_MINUTES} minutes`)
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async () => {
    const vnNow = nowInVietnam();
    const nowTotalMinutes = vnNow.getUTCHours() * 60 + vnNow.getUTCMinutes();
    const dateKey = dateKeyVN(vnNow);

    const snap = await ref("medicines")
      .orderByChild("isActive")
      .equalTo(true)
      .get();
    if (!snap.exists()) return null;

    const medicines = snap.val();
    const tasks = [];

    Object.keys(medicines).forEach((medicineId) => {
      const medicine = medicines[medicineId];
      const timeSlots = medicine.timeSlots || [];
      timeSlots.forEach((slot, index) => {
        if (!slot || !slot.time) return;
        const [slotHour, slotMinute] = slot.time.split(":").map(Number);
        if (Number.isNaN(slotHour) || Number.isNaN(slotMinute)) return;
        const slotTotalMinutes = slotHour * 60 + slotMinute;
        const actionId = `${medicineId}___${dateKey}_${index}`;

        const remindBeforeMinutes = medicine.remindBeforeMinutes || 0;
        if (remindBeforeMinutes > 0) {
          const earlyTotalMinutes = slotTotalMinutes - remindBeforeMinutes;
          if (
            nowTotalMinutes >= earlyTotalMinutes &&
            nowTotalMinutes < earlyTotalMinutes + CHECK_WINDOW_MINUTES
          ) {
            tasks.push(
              sendEarlyReminderIfNeeded(
                medicineId,
                actionId,
                medicine,
                remindBeforeMinutes
              )
            );
          }
        }

        if (
          nowTotalMinutes >= slotTotalMinutes &&
          nowTotalMinutes < slotTotalMinutes + CHECK_WINDOW_MINUTES
        ) {
          const dateScheduled = scheduledDateUtc(dateKey, slotHour, slotMinute);
          tasks.push(
            createActionIfNeeded(medicineId, actionId, medicine, dateScheduled)
          );
        }
      });
    });

    await Promise.all(tasks);
    return null;
  });
