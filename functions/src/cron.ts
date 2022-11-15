import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { db } from "./app";

// TODO: Remove if not testing the logic
export const testLogic = functions.https.onRequest(async (req, res) => {
  deleteOldLobbies();
  res.send({ message: "Hi" });
});

// Schedule for every day at 3:15AM
// export const deleteOldLobbies = functions.pubsub.schedule("15 3 * * *").onRun(async (context) => {
const deleteOldLobbies = async () => {
  // TODO: Remove if not testing the logic
  const dayFromTodaySecs = firestore.Timestamp.now().seconds - 86_400; // A day ago from today in seconds
  const dayFromTodayDate = firestore.Timestamp.fromDate(new Date(dayFromTodaySecs * 1000)); // a day ago from today in date object

  // query all lobby documents that expiration date is either less than or equal from 24 hours from today
  const oldLobbies = await db.collection("/lobbies").where("expiration", "<=", dayFromTodayDate).get();

  if (oldLobbies.empty) {
    return;
  }

  // delete all lobby docs with batch
  const batch = db.batch();
  for (const lobby of oldLobbies.docs) {
    batch.delete(lobby.ref);
  }

  await batch.commit();
}; // TODO: remove this once tested
// });
