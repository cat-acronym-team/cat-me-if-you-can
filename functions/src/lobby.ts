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
import { isLobbyRequest, LobbyCreationResponse } from "./firebase-functions-types";
import { AVATARS, GAME_STATE_DURATIONS, Lobby, Vote } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import { generatePairs } from "./util";
import { db } from "./app";
import { getRandomPromptPair } from "./prompts";
import { deleteChatRooms } from "./chat";
import { findVoteOff } from "./vote";
import { determineWinner } from "./result";

function generateLobbyCode() {
  const chars = new Array(6);
  for (let i = 0; i < 6; i++) {
    // random character between 'a' and 'z'
    chars[i] = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  return chars.join("");
}

export const createLobby = functions.https.onCall(async (data: unknown, context): Promise<LobbyCreationResponse> => {
  if (context.auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }

  const userDoc = await userCollection.doc(context.auth.uid).get();
  const userData = userDoc.data();

  if (userData == undefined) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }

  const lobbyData: Lobby = {
    uids: [context.auth.uid],
    players: [
      {
        alive: true,
        avatar: userData.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
        displayName: userData.displayName,
        votes: 0,
      },
    ],
    state: "WAIT",
  };

  // try making lobby 5 times before giving up
  for (let i = 0; i < 5; i++) {
    const code = generateLobbyCode();

    try {
      await lobbyCollection.doc(code).create(lobbyData);
      return { code };
    } catch (error) {
      continue;
    }
  }

  throw new functions.https.HttpsError("internal", "Cannot create document. Maximum number of tries exceeded");
});

export const startGame = functions.https.onCall(async (data: unknown, context): Promise<void> => {
  // no auth then you shouldn't be here
  if (context.auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }
  // validate code
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }
  // get lobby doc
  const lobby = await lobbyCollection.doc(data.code).get();
  if (lobby.exists === false) {
    throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
  }
  // check if the request is coming from the host of the game
  const { uids } = lobby.data() as Lobby;
  if (context.auth.uid !== uids[0]) {
    throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
  }

  const privatePlayerCollection = getPrivatePlayerCollection(lobby.ref);
  for (const uid of uids) {
    privatePlayerCollection.doc(uid).create({ role: "CAT" });
  }

  await lobbyCollection.doc(data.code).update({ state: "PROMPT" });
});

export const joinLobby = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  // no auth then you shouldn't be here
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }
  // validate code
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }

  return db.runTransaction(async (transaction) => {
    // lobby doc
    const lobby = lobbyCollection.doc(data.code);
    const lobbyInfo = await transaction.get(lobby);
    // extra validation to make sure it exist
    if (lobbyInfo.exists === false) {
      throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
    }
    // user doc
    const user = await transaction.get(userCollection.doc(auth.uid));
    // make sure this user has a doc with a displayName and avatar
    if (user.exists === false) {
      throw new functions.https.HttpsError("not-found", "You need to have a displayName and avatar!");
    }
    // user data
    const userInfo = user.data() as UserData;

    // get lobby data
    const { players, uids } = lobbyInfo.data() as Lobby;
    if (uids.includes(auth.uid)) {
      throw new functions.https.HttpsError("already-exists", "You are already in the lobby!");
    }

    // change avatar randomly if it is already taken
    const takenAvatars = players.map((player) => player.avatar);
    while (userInfo.avatar == 0 || takenAvatars.includes(userInfo.avatar)) {
      userInfo.avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    }

    // add player
    await transaction.update(lobby, {
      players: firestore.FieldValue.arrayUnion({ ...userInfo, alive: true, votes: 0 }),
      uids: firestore.FieldValue.arrayUnion(auth.uid),
    });
  });
});

export const leaveLobby = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;

  // no auth then you shouldn't be here
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }

  // validate code
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }

  return db.runTransaction(async (transaction) => {
    // lobby doc
    const lobby = lobbyCollection.doc(data.code);
    const lobbyInfo = await transaction.get(lobby);

    // extra validation to make sure it exist
    if (lobbyInfo.exists === false) {
      throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
    }

    // get lobby data
    const { players, uids } = lobbyInfo.data() as Lobby;

    // Get position of the Player
    const playerPos = uids.indexOf(auth.uid);

    // If the last player is leaving delete the document instead
    if (uids.length === 1) {
      transaction.delete(lobby);
    } else {
      // Remove player from the lobby
      transaction.update(lobby, {
        players: firestore.FieldValue.arrayRemove(players[playerPos]),
        uids: firestore.FieldValue.arrayRemove(auth.uid),
      });
    }
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

  if (lobby.state == "CHAT" && oldLobby.state != "CHAT") {
    const expiration = firestore.Timestamp.fromMillis(
      firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS.END * 1000 // TODO: replace with correct timer when doing pull request
    );
    lobbyDocRef.update({ expiration });
  }
  if (lobby.state == "VOTE" && oldLobby.state != "VOTE") {
    const expiration = firestore.Timestamp.fromMillis(
      firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS.VOTE * 1000
    );
    lobbyDocRef.update({ expiration });
  }
  if (lobby.state == "RESULT" && oldLobby.state != "RESULT") {
    const expiration = firestore.Timestamp.fromMillis(
      firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS.RESULT * 1000
    );
    lobbyDocRef.update({ expiration });
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

      // TODO: check if we have a stalker
      const { pairs } = generatePairs(lobbyData);
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
          isPromptAnswer: true,
        });
        await getChatRoomMessagesCollection(room).add({
          sender: two,
          text: twoAnswer,
          timestamp: firestore.Timestamp.now(),
          isPromptAnswer: true,
        });
      });
    });
  });

export const onVoteWrite = functions.firestore.document("/lobbies/{code}/votes/{uid}").onWrite((change, context) => {
  const { code } = context.params;

  // check if the after change exists
  // we want to do this because onwrite is for oncreation, onupdate, and ondelete
  if (!change.after.exists) {
    return;
  }

  const lobbyDocRef = lobbyCollection.doc(code);

  const oldVoteDoc = change.before.data() as Vote | undefined;
  const latestVoteDoc = change.after.data() as Vote;

  return db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyDocRef);
    const lobbyData = lobbyDoc.data();

    if (lobbyData == undefined || lobbyData.state !== "VOTE") {
      return;
    }

    const { players, uids } = lobbyData;

    // decrement old target
    if (oldVoteDoc != undefined) {
      const oldTarget = players[uids.indexOf(oldVoteDoc.target)];
      if (oldTarget.votes != 0) {
        oldTarget.votes -= 1;
      }
    }

    // increment new target
    players[uids.indexOf(latestVoteDoc.target)].votes += 1;

    transaction.update(lobbyDocRef, { players });
  });
});

export const verifyExpiration = functions.https.onCall(async (data, context) => {
  // check auth
  if (context.auth == undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }
  // check the data request
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of ExpirationRequest type.");
  }
  // get lobby doc
  const lobbyDocRef = lobbyCollection.doc(data.code);

  // start transaction
  return db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyDocRef);
    const lobby = lobbyDoc.data();
    if (lobby === undefined) {
      throw new functions.https.HttpsError("not-found", "Lobby does not exist.");
    }

    if (lobby.expiration == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "Lobby has no expiration.");
    }

    // if the time sent is less than expiration
    if (Date.now() < lobby.expiration.toMillis()) {
      throw new functions.https.HttpsError("invalid-argument", "Too early to make request.");
    }
    // if the timer sent is equal or greater than
    // change to the next phase

    // TODO: potential if checks for other states that require a timer
    // if the state is chat then delete chatrooms
    if (lobby.state === "CHAT") {
      await deleteChatRooms(lobby, lobbyDocRef, transaction);
    }
    if (lobby.state === "VOTE") {
      await findVoteOff(lobby, lobbyDocRef, transaction);
    }
    if (lobby.state === "RESULT") {
      await determineWinner(lobby, lobbyDocRef, transaction);
    }

    return;
  });
});
