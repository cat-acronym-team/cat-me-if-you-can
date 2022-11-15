import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { db } from "./app";

// Schedule for every day at 3:15AM
export const deleteOldLobbies = functions.pubsub.schedule("15 3 * * *").onRun(async (context) => {
  const oneDayAgoAsSecs = firestore.Timestamp.now().seconds - 24 * 60 * 60; // A day ago from today in seconds
  const oneDayAgoAsDate = firestore.Timestamp.fromDate(new Date(oneDayAgoAsSecs * 1000)); // a day ago from today in date object

  // query all lobby documents that expiration date is either less than or equal from 24 hours from today
  const oldLobbies = await db.collection("/lobbies").where("expiration", "<=", oneDayAgoAsDate).get();

  if (oldLobbies.empty) {
    return;
  }

  // delete all lobby docs with batch
  const batch = db.batch();
  for (const lobby of oldLobbies.docs) {
    batch.delete(lobby.ref);
  }

  await batch.commit();
});
