import * as functions from "firebase-functions";
import { isChangeAvatarData } from "./functions-types/avatar";
import { lobbyCollection } from "./firestore-collections";
import { db } from "./app";

export const changeAvatar = functions.https.onCall((data: unknown, context): Promise<void> => {
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

    if (auth.uid in lobbyData.players) {
      throw new functions.https.HttpsError("permission-denied", "User is not in the lobby.");
    }

    const taken = Object.values(lobbyData.players).some((player) => player.avatar === data.avatar);
    if (taken) {
      throw new functions.https.HttpsError("already-exists", "Avatar is already taken.");
    }

    lobbyData.players[auth.uid].avatar = data.avatar;

    await transaction.update(lobbyDocRef, lobbyData);
  });
});
