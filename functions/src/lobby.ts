import * as functions from "firebase-functions";
import { db } from "./app";
import { getPromptAnswerCollection, lobbyCollection } from "./firestore-collections";

export const collectPromptAnswers = functions.firestore
  .document("/lobbies/{code}/promptAnswers/{uid}")
  .onCreate((change, context) => {
    const { code, uid } = context.params;

    const lobbyDocRef = lobbyCollection.doc(code);

    return db.runTransaction(async (transaction) => {
      const lobbyDoc = await transaction.get(lobbyDocRef);

      const lobbyData = lobbyDoc.data();

      if (lobbyData == undefined || lobbyData.state !== "PROMPT" || !lobbyData.uids.includes(uid)) {
        transaction.delete(change.ref);
        return;
      }

      const missingUids = new Set(lobbyData.uids);

      const promptAnswerCollection = getPromptAnswerCollection(lobbyDocRef);

      const promptAnswerDocs = await transaction.get(promptAnswerCollection);

      for (const promptAnswerDoc of promptAnswerDocs.docs) {
        missingUids.delete(promptAnswerDoc.id);
      }

      if (missingUids.size > 0) {
        return;
      }

      const promptAnswers = new Map<string, string>();

      for (const promptAnswerDoc of promptAnswerDocs.docs) {
        promptAnswers.set(promptAnswerDoc.id, promptAnswerDoc.data().answer);
        transaction.delete(promptAnswerDoc.ref);
      }

      transaction.update(lobbyDocRef, { state: "CHAT" });

      functions.logger.log(promptAnswers);

      // TODO #32 create a one on one chat and store the promptAnswers in it
    });
  });
