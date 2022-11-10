import * as functions from "firebase-functions";
import { lobbyCollection } from "./firestore-collections";
import { isKickBanRequest } from "./firebase-functions-types";
import { db } from "./app";
import { firestore } from "firebase-admin";

export const kick = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isKickBanRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of LobbyRequest type");
  }

  return db.runTransaction(async (transaction) => {
    const lobbyRef = lobbyCollection.doc(data.code);
    const lobbySnapshot = await transaction.get(lobbyRef);
    const lobbyData = lobbySnapshot.data();
    if (lobbyData == undefined) {
      throw new functions.https.HttpsError("not-found", "Lobby not found.");
    }
    if (lobbyData.uids[0] !== auth.uid) {
      throw new functions.https.HttpsError("permission-denied", "User making request is not the host.");
    }

    const playerPos = lobbyData.uids.indexOf(data.uid);
    transaction.update(lobbyRef, {
      players: firestore.FieldValue.arrayRemove(lobbyData.players[playerPos]),
      uids: firestore.FieldValue.arrayRemove(data.uid),
    });
  });
});

export const ban = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isKickBanRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of LobbyRequest type");
  }

  return db.runTransaction(async (transaction) => {
    const lobbyRef = lobbyCollection.doc(data.code);
    const lobbySnapshot = await transaction.get(lobbyRef);
    const lobbyData = lobbySnapshot.data();
    if (lobbyData == undefined) {
      throw new functions.https.HttpsError("not-found", "Lobby not found.");
    }
    if (lobbyData.uids[0] !== auth.uid) {
      throw new functions.https.HttpsError("permission-denied", "User making request is not the host.");
    }

    const playerPos = lobbyData.uids.indexOf(data.uid);
    transaction.update(lobbyRef, {
      players: firestore.FieldValue.arrayRemove(lobbyData.players[playerPos]),
      uids: firestore.FieldValue.arrayRemove(data.uid),
    });
  });
});
