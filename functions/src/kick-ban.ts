import * as functions from "firebase-functions";
import { lobbyCollection } from "./firestore-collections";
import { isKickBanRequest } from "./firebase-functions-types";
import { db } from "./app";
import { FieldValue } from "firebase-admin/firestore";
import { Lobby } from "./firestore-types/lobby";
import { updateHost } from "./util";

export const kick = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isKickBanRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of KickBanRequest type");
  }

  return db.runTransaction(async (transaction) => {
    const lobbyRef = lobbyCollection.doc(data.code);
    const lobbySnapshot = await transaction.get(lobbyRef);
    const lobbyData = lobbySnapshot.data();
    if (lobbyData == undefined) {
      throw new functions.https.HttpsError("not-found", "Lobby not found.");
    }
    if (auth.uid != lobbyData.host) {
      throw new functions.https.HttpsError("permission-denied", "User making request is not the host.");
    }

    const { players } = lobbyData as Lobby;

    delete players[data.uid];

    if (Object.keys(players).length === 0) {
      transaction.delete(lobbyRef);
    } else {
      transaction.update(lobbyRef, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
        players: players satisfies Lobby["players"] as any,
        host: updateHost(players),
      });
    }
  });
});

export const ban = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isKickBanRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of KickBanRequest type");
  }

  return db.runTransaction(async (transaction) => {
    const lobbyRef = lobbyCollection.doc(data.code);
    const lobbySnapshot = await transaction.get(lobbyRef);
    const lobbyData = lobbySnapshot.data();
    if (lobbyData == undefined) {
      throw new functions.https.HttpsError("not-found", "Lobby not found.");
    }
    if (auth.uid != lobbyData.host) {
      throw new functions.https.HttpsError("permission-denied", "User making request is not the host.");
    }

    const { players } = lobbyData as Lobby;

    delete players[data.uid];

    if (Object.keys(players).length === 0) {
      transaction.delete(lobbyRef);
    } else {
      transaction.update(lobbyRef, {
        bannedPlayers: FieldValue.arrayUnion(data.uid),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
        players: players satisfies Lobby["players"] as any,
        host: updateHost(players),
      });
    }
  });
});
