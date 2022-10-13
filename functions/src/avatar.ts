import { Player } from "./firestore-types/lobby";
import * as functions from "firebase-functions";
import { ChangeAvatarData, avatarCheck } from "./function-types/avatar";

export const changeAvatar = functions.https.onCall((data: unknown, context) => {
  if (!avatarCheck(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of ChangeAvatarData type.");
  }
});
