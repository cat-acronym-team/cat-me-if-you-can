import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import {
  getChatRoomCollection,
  getChatRoomMessagesCollection,
  getPrivatePlayerCollection,
  getPromptAnswerCollection,
  lobbyCollection,
  userCollection,
} from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import { generatePairs } from "./util";
import { db } from "./app";
import { getRandomPromptPair } from "./prompts";

export const startGame = functions.https.onCall(async (data: unknown, context) => {
  // no auth then you shouldn't be here
  if (context.auth === undefined) {
    return { error: "Not Signed In" };
  }
  // validate code
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }
  // get lobby doc
  const lobby = await lobbyCollection.doc(data.code).get();
  if (lobby.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }
  // check if the request is coming from the host of the game
  const { uids } = lobby.data() as Lobby;
  if (context.auth.uid !== uids[0]) {
    return { error: "Not allowed to start game!" };
  }

  return lobbyCollection.doc(data.code).update({ state: "PROMPT" });
});

export const joinLobby = functions.https.onCall(async (data: unknown, context) => {
  // no auth then you shouldn't be here
  if (context.auth === undefined) {
    return { error: "Not Signed In" };
  }
  // validate code
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }
  // lobby doc
  const lobby = lobbyCollection.doc(data.code);
  const lobbyInfo = await lobby.get();
  // extra validation to make sure it exist
  if (lobbyInfo.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }
  // user doc
  const user = await userCollection.doc(context.auth.uid).get();
  // make sure this user has a doc with a displayName and avatar
  if (user.exists === false) {
    return { error: "You need to have a displayName and avatar!" };
  }
  // user data
  const userInfo = user.data() as UserData;

  // get lobby data
  const { players, uids } = lobbyInfo.data() as Lobby;
  if (uids.includes(context.auth.uid)) {
    return { error: "You are already in the lobby!" };
  }
  // add player
  return lobby.update({
    players: [...players, { ...userInfo, alive: true }],
    uids: [...uids, context.auth.uid],
  });
});

// TODO: replace with the correct trigger
export const onLobbyUpdate = functions.firestore.document("/lobbies/{code}").onUpdate(async (change, context) => {
  const lobbyDocRef = change.after.ref as firestore.DocumentReference<Lobby>;
  const lobby = change.after.data() as Lobby;
  const oldLobby = change.before.data() as Lobby;

  if (lobby.state == "PROMPT" && oldLobby.state != "PROMPT") {
    await startPrompt(lobbyDocRef);
  }
});

function startPrompt(lobbyDocRef: firestore.DocumentReference<Lobby>) {
  const [catPrompt, catfishPrompt] = getRandomPromptPair();

  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

  return db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyDocRef);

    const lobbyData = lobbyDoc.data();

    if (!lobbyData) {
      throw new Error("Lobby not found");
    }

    await Promise.all(
      lobbyData.uids.map(async (uid) => {
        const privatePlayerDocRef = privatePlayerCollection.doc(uid);

        const privatePlayerDoc = await transaction.get(privatePlayerDocRef);

        const privatePlayerData = privatePlayerDoc.data();

        if (!privatePlayerData) {
          throw new Error(`Private player not found for uid ${uid}`);
        }

        transaction.set(
          privatePlayerDocRef,
          { prompt: privatePlayerData.role == "CAT" ? catPrompt : catfishPrompt },
          { merge: true }
        );
      })
    );

    transaction.set(lobbyDocRef, { state: "PROMPT" }, { merge: true });
  });
}

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

      const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

      const promptAnswers = new Map<string, string>();

      for (const promptAnswerDoc of promptAnswerDocs.docs) {
        promptAnswers.set(promptAnswerDoc.id, promptAnswerDoc.data().answer);
        transaction.delete(promptAnswerDoc.ref);
        transaction.update(privatePlayerCollection.doc(promptAnswerDoc.id), { prompt: firestore.FieldValue.delete() });
      }

      transaction.update(lobbyDocRef, { state: "CHAT" });

      const { pairs, stalker } = generatePairs(lobbyData);
      functions.logger.info(stalker);

      if (stalker != undefined) {
        privatePlayerCollection.doc(stalker).update({ stalker: true });
      }
      // create a chatroom for each pair
      pairs.forEach(async ({ one, two }) => {
        const room = await getChatRoomCollection(lobbyDocRef).add({ pair: [one, two], viewers: [] });
        // get answers of the pair
        const oneAnswer = promptAnswers.get(one) as string;
        const twoAnswer = promptAnswers.get(two) as string;
        // place answers in chatMessages inside their room
        await getChatRoomMessagesCollection(room).add({
          sender: one,
          text: oneAnswer,
          timestamp: firestore.Timestamp.now(),
        });
        await getChatRoomMessagesCollection(room).add({
          sender: two,
          text: twoAnswer,
          timestamp: firestore.Timestamp.now(),
        });
      });
    });
  });
