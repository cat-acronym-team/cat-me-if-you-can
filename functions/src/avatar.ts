import * as functions from "firebase-functions";
import { isChangeAvatarData } from "./functions-types/avatar";
import { lobbyCollection } from "./firestore-collections";
import { db } from "./app";

export const changeAvatar = functions.https.onCall((data: unknown, context) => {
  const auth = context.auth;

  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isChangeAvatarData(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of ChangeAvatarData type.");
  }

  const lobbyDocRef = lobbyCollection.doc(data.lobbyCode);

  return db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyDocRef);
    const lobbyData = lobbyDoc.data();
    if (lobbyData === undefined) {
      throw new functions.https.HttpsError("not-found", "Lobby does not exist.");
    }

    const playerIndex = lobbyData.uids.findIndex((uid) => uid === auth.uid);
    if (playerIndex == -1) {
      throw new functions.https.HttpsError("permission-denied", "User is not in the lobby.");
    }

    const taken = lobbyData.players.some((player) => player.avatar === data.avatar);
    if (taken) {
      throw new functions.https.HttpsError("already-exists", "Avatar is already taken.");
    }

    lobbyData.players[playerIndex].avatar = data.avatar;

    return transaction.update(lobbyDocRef, lobbyData);
  });
});
