import * as functions from "firebase-functions";
import { lobbyCollection } from "./firestore-collections";
import { isKickBanRequest } from "./firebase-functions-types";
import { db } from "./app";
import { firestore } from "firebase-admin";
import { Lobby } from "./firestore-types/lobby";

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
    if (auth.uid == lobbyData.host) {
      throw new functions.https.HttpsError("permission-denied", "User making request is not the host.");
    }

    const { players, host } = lobbyData as Lobby;
    const newPlayers: Lobby["players"] = {};

    for (const uid in players) {
      if (uid !== auth.uid) {
        newPlayers[uid] = players[uid];
      }
    }

    if (Object.keys(players).length === 1) {
      transaction.delete(lobbyRef);
    } else {
      // if he's the host do this check
      let newHost: string | undefined;
      let earliestJoinedTime = firestore.Timestamp.now();

      if (auth.uid == host) {
        for (const uid in players) {
          const currentPlayerTimeJoined = players[uid].timeJoined.seconds * 1000;
          if (currentPlayerTimeJoined < earliestJoinedTime.toMillis() && uid != auth.uid) {
            earliestJoinedTime = players[uid].timeJoined;
            newHost = uid;
          }

          functions.logger.info(uid + " | " + currentPlayerTimeJoined + " < " + earliestJoinedTime.toMillis());
        }
      } else {
        newHost = auth.uid;
      }

      transaction.update(lobbyRef, {
        players: newPlayers,
        host: newHost ?? host,
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
    if (auth.uid == lobbyData.host) {
      throw new functions.https.HttpsError("permission-denied", "User making request is not the host.");
    }

    const { players, host } = lobbyData as Lobby;
    const newPlayers: Lobby["players"] = {};

    for (const uid in players) {
      if (uid !== auth.uid) {
        newPlayers[uid] = players[uid];
      }
    }

    if (Object.keys(players).length === 1) {
      transaction.delete(lobbyRef);
    } else {
      // if he's the host do this check
      let newHost: string | undefined;
      let earliestJoinedTime = firestore.Timestamp.now();

      if (auth.uid == host) {
        for (const uid in players) {
          const currentPlayerTimeJoined = players[uid].timeJoined.seconds * 1000;
          if (currentPlayerTimeJoined < earliestJoinedTime.toMillis() && uid != auth.uid) {
            earliestJoinedTime = players[uid].timeJoined;
            newHost = uid;
          }

          functions.logger.info(uid + " | " + currentPlayerTimeJoined + " < " + earliestJoinedTime.toMillis());
        }
      } else {
        newHost = auth.uid;
      }

      transaction.update(lobbyRef, {
        bannedPlayers: firestore.FieldValue.arrayUnion(data.uid),
        players: newPlayers,
        host: newHost ?? host,
      });
    }
  });
});
