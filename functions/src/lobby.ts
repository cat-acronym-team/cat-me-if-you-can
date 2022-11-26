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
import { AVATARS, GAME_STATE_DURATIONS_DEFAULT, Lobby, Vote } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import { generatePairs } from "./util";
import { db } from "./app";
import { getRandomPromptPair } from "./prompts";
import { deleteChatRooms, deleteLobbyChatMessages } from "./chat";
import { assignRole } from "./role";
import { endGameProcess } from "./winloss";
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
    alivePlayers: [context.auth.uid],
    lobbySettings: {
      catfishAmount: 1,
      promptTime: GAME_STATE_DURATIONS_DEFAULT.PROMPT,
      chatTime: GAME_STATE_DURATIONS_DEFAULT.CHAT,
      voteTime: GAME_STATE_DURATIONS_DEFAULT.VOTE,
    },
    expiration: firestore.Timestamp.fromMillis(firestore.Timestamp.now().toMillis() + 3_600_000 * 3),
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
  const auth = context.auth;
  // no auth then you shouldn't be here
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }
  // validate code
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }
  await db.runTransaction(async (transaction) => {
    // get lobby doc
    const lobby = await transaction.get(lobbyCollection.doc(data.code));
    if (lobby.exists === false) {
      throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
    }
    // check if the request is coming from the host of the game
    const { uids } = lobby.data() as Lobby;
    if (auth.uid !== uids[0]) {
      throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
    }

    assignRole(lobby, transaction);
  });
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
    transaction.update(lobby, {
      players: firestore.FieldValue.arrayUnion({
        displayName: userInfo.displayName,
        avatar: userInfo.avatar,
        alive: true,
        votes: 0,
      }),
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

export const onLobbyUpdate = functions.firestore.document("/lobbies/{code}").onUpdate((change, context) => {
  const lobbyDocRef = change.after.ref as firestore.DocumentReference<Lobby>;
  const lobby = change.after.data() as Lobby;
  const lobbyBefore = change.before.data() as Lobby;
  let hasChanged = lobby.players.length != lobbyBefore.players.length;
  const alivePlayers = [];
  for (let i = 0; i < lobby.uids.length; i++) {
    if (!hasChanged && lobby.players[i].alive != lobbyBefore.players[i].alive) {
      hasChanged = true;
    }
    if (lobby.players[i].alive) {
      alivePlayers.push(lobby.uids[i]);
    }
  }
  if (hasChanged) {
    lobbyDocRef.update({ alivePlayers: alivePlayers });
  }
});

export async function startPrompt(lobbyDoc: firestore.DocumentSnapshot<Lobby>, transaction: firestore.Transaction) {
  const [catPrompt, catfishPrompt] = getRandomPromptPair();

  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDoc.ref);

  const lobbyData = lobbyDoc.data();

  if (lobbyData == undefined) {
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

      transaction.update(privatePlayerDocRef, {
        prompt: privatePlayerData.role == "CAT" ? catPrompt : catfishPrompt,
      });
    })
  );
  // expiration
  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + lobbyData.lobbySettings.promptTime * 1000
  );

  transaction.update(lobbyDoc.ref, { state: "PROMPT", expiration });
}

export async function collectPromptAnswers(
  lobbyDoc: firestore.DocumentSnapshot<Lobby>,
  transaction: firestore.Transaction
) {
  const lobbyData = lobbyDoc.data();

  if (lobbyData == undefined) {
    throw new functions.https.HttpsError("not-found", "There's no data in this lobby");
  }

  const promptAnswerCollection = getPromptAnswerCollection(lobbyDoc.ref);

  const promptAnswerDocs = await transaction.get(promptAnswerCollection);

  const promptAnswers = new Map<string, string>();

  for (const promptAnswerDoc of promptAnswerDocs.docs) {
    promptAnswers.set(promptAnswerDoc.id, promptAnswerDoc.data().answer);
    transaction.delete(promptAnswerDoc.ref);
  }

  // expiration set
  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + lobbyData.lobbySettings.chatTime * 1000
  );
  transaction.update(lobbyDoc.ref, { state: "CHAT", expiration });

  const { pairs, stalker } = generatePairs(lobbyData);

  if (stalker != undefined) {
    getPrivatePlayerCollection(lobbyDoc.ref).doc(stalker).update({ stalker: true });
  }

  // create a chatroom for each pair
  for (const { one, two } of pairs) {
    const roomRef = getChatRoomCollection(lobbyDoc.ref).doc(one + two);
    transaction.create(roomRef, { pair: [one, two], viewers: [] });
    // get answers of the pair
    const oneAnswer = promptAnswers.get(one) ?? "No answer";
    const twoAnswer = promptAnswers.get(two) ?? "No answer";
    // place answers in chatMessages inside their room
    const messageRef1 = getChatRoomMessagesCollection(roomRef).doc(one);
    transaction.create(messageRef1, {
      sender: one,
      text: oneAnswer,
      timestamp: firestore.Timestamp.now(),
      isPromptAnswer: true,
    });
    const messageRef2 = getChatRoomMessagesCollection(roomRef).doc(two);
    transaction.create(messageRef2, {
      sender: two,
      text: twoAnswer,
      timestamp: firestore.Timestamp.now(),
      isPromptAnswer: true,
    });
  }
}

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

export const verifyExpiration = functions.https.onCall((data, context): Promise<void> => {
  // check auth
  if (context.auth == undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }
  // check the data request
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of LobbyRequest type.");
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
    if (lobby.state === "ROLE") {
      await deleteLobbyChatMessages(lobbyDocRef, transaction);
      await startPrompt(lobbyDoc, transaction);
    }
    if (lobby.state === "PROMPT") {
      await collectPromptAnswers(lobbyDoc, transaction);
    }
    if (lobby.state === "CHAT") {
      await deleteChatRooms(lobby, lobbyDocRef, transaction);
    }
    // Applies the stats once the timer on the end screen ends
    if (lobby.state === "END") {
      await endGameProcess(lobby, lobbyDocRef, transaction);
    }
    if (lobby.state === "VOTE") {
      findVoteOff(lobby, lobbyDocRef, transaction);
    }
    if (lobby.state === "RESULT") {
      await deleteLobbyChatMessages(lobbyDocRef, transaction);
      await determineWinner(lobbyDoc, transaction);
    }

    return;
  });
});
