import { Timestamp, Transaction, DocumentSnapshot } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import {
  getChatRoomCollection,
  getChatRoomMessagesCollection,
  getPrivatePlayerCollection,
  getPromptAnswerCollection,
  lobbyCollection,
  userCollection,
} from "./firestore-collections";
import { isLobbyRequest, isLobbySettingsRequest, LobbyCreationResponse } from "./firebase-functions-types";
import { AVATARS, GAME_STATE_DURATIONS_DEFAULT, Lobby, Vote } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import { generatePairs, updateHost } from "./util";
import { db } from "./app";
import { getRandomPromptPair } from "./prompts";
import { deleteChatCollections, setAndDeleteAnswers, deleteLobbyChatMessages } from "./chat";
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
    players: {
      [context.auth.uid]: {
        alive: true,
        avatar: userData.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
        displayName: userData.displayName,
        votes: 0,
        timeJoined: Timestamp.now(),
      },
    },
    skipVote: 0,
    bannedPlayers: [],
    state: "WAIT",
    lobbySettings: {
      catfishAmount: 1,
      promptTime: GAME_STATE_DURATIONS_DEFAULT.PROMPT,
      chatTime: GAME_STATE_DURATIONS_DEFAULT.CHAT,
      voteTime: GAME_STATE_DURATIONS_DEFAULT.VOTE,
    },
    expiration: Timestamp.fromMillis(Timestamp.now().toMillis() + 3_600_000 * 3),
    host: context.auth.uid,
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

  const lobbyDoc = lobbyCollection.doc(data.code);

  await db.runTransaction(async (transaction) => {
    // get lobby doc
    const lobby = await transaction.get(lobbyDoc);
    if (lobby.exists === false) {
      throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
    }

    // check if the request is coming from the host of the game
    const { players, lobbySettings, host } = lobby.data() as Lobby;

    const minPlayers = lobbySettings.catfishAmount * 2 + 2;

    if (auth.uid !== host) {
      throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
    }

    // throw an error if there aren't enough players in the lobby
    if (Object.keys(players).length < minPlayers) {
      throw new functions.https.HttpsError("failed-precondition", "Not enough players to start the game!");
    }

    assignRole(lobby, transaction);
  });

  await deleteLobbyChatMessages(lobbyDoc);
});

export const joinLobby = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  const maxPlayers = 8;
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
    const lobbyData = lobbyInfo.data();
    const privatePlayerCollection = getPrivatePlayerCollection(lobby);
    // extra validation to make sure it exist
    if (lobbyInfo.exists === false || lobbyData == undefined) {
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
    const { players, bannedPlayers } = lobbyInfo.data() as Lobby;
    if (auth.uid in players) {
      throw new functions.https.HttpsError("already-exists", "You are already in the lobby!");
    }

    // check if user is banned
    if (bannedPlayers.includes(auth.uid)) {
      throw new functions.https.HttpsError("permission-denied", "You are banned from this lobby!");
      // throw an error if the user is banned
    }

    // throw an error if the lobby is already full
    if (Object.keys(players).length >= maxPlayers) {
      throw new functions.https.HttpsError("failed-precondition", "Lobby is full!");
    }

    // throws an error if current display name is already taken
    for (const player in players) {
      if (players[player].displayName == userInfo.displayName) {
        throw new functions.https.HttpsError(
          "already-exists",
          userInfo.displayName + " is already taken in this lobby!"
        );
      }
    }

    // change avatar randomly if it is already taken
    const takenAvatars = Object.values(players).map((player) => player.avatar);
    while (userInfo.avatar == 0 || takenAvatars.includes(userInfo.avatar)) {
      userInfo.avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    }

    // Check if the lobby state is not wait
    let alive = true;
    if (lobbyData.state != "WAIT") {
      const privatePlayerDocRef = privatePlayerCollection.doc(user.id);
      transaction.create(privatePlayerDocRef, { role: "SPECTATOR", stalker: false });
      alive = false;
    }

    // add player
    players[auth.uid] = {
      alive,
      avatar: userInfo.avatar,
      displayName: userInfo.displayName,
      votes: 0,
      timeJoined: Timestamp.now(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
    transaction.update(lobby, { players: players satisfies Lobby["players"] as any });
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
    const { players } = lobbyInfo.data() as Lobby;

    delete players[auth.uid];

    // If the last player is leaving delete the document instead
    if (Object.keys(players).length === 0) {
      transaction.delete(lobby);
    } else {
      // Remove player from the lobby
      transaction.update(lobby, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
        players: players satisfies Lobby["players"] as any,
        host: updateHost(lobbyInfo.data(), auth.uid),
      });
    }
  });
});

export const applyLobbySettings = functions.https.onCall(async (data: unknown, context): Promise<void> => {
  const auth = context.auth;
  // no auth then you shouldn't be here
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }
  // validate code
  if (!isLobbySettingsRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }

  const settings = data.lobbySettings;

  await db.runTransaction(async (transaction) => {
    // get lobby doc
    const lobby = lobbyCollection.doc(data.code);
    const lobbyInfo = await transaction.get(lobby);

    if (lobbyInfo.exists === false) {
      throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
    }
    // check if the request is coming from the host of the game
    const { host } = lobbyInfo.data() as Lobby;
    if (auth.uid !== host) {
      throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
    }

    transaction.update(lobby, {
      lobbySettings: settings,
    });
  });
});

export async function startPrompt(lobbyDoc: DocumentSnapshot<Lobby>, transaction: Transaction) {
  const [catPrompt, catfishPrompt] = getRandomPromptPair();

  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDoc.ref);

  const lobbyData = lobbyDoc.data();

  if (lobbyData == undefined) {
    throw new Error("Lobby not found");
  }

  const privatePlayerDocs = await Promise.all(
    Object.keys(lobbyData.players).map((uid) => transaction.get(privatePlayerCollection.doc(uid)))
  );

  for (const privatePlayerDoc of privatePlayerDocs) {
    const privatePlayerData = privatePlayerDoc.data();

    if (!privatePlayerData) {
      throw new Error(`Private player not found for uid ${privatePlayerDoc.id}`);
    }

    transaction.update(privatePlayerDoc.ref, {
      prompt: privatePlayerData.role == "CAT" ? catPrompt : catfishPrompt,
    });
  }

  const expiration = Timestamp.fromMillis(Timestamp.now().toMillis() + lobbyData.lobbySettings.promptTime * 1000);

  transaction.update(lobbyDoc.ref, { state: "PROMPT", expiration });
}

export async function collectPromptAnswers(lobbyDoc: DocumentSnapshot<Lobby>, transaction: Transaction) {
  const lobbyData = lobbyDoc.data();

  if (lobbyData == undefined) {
    throw new functions.https.HttpsError("not-found", "There's no data in this lobby");
  }

  const promptAnswerCollection = getPromptAnswerCollection(lobbyDoc.ref);

  const promptAnswerDocs = await transaction.get(promptAnswerCollection);

  const promptAnswers = new Map<string, string>();

  for (const promptAnswerDoc of promptAnswerDocs.docs) {
    promptAnswers.set(promptAnswerDoc.id, promptAnswerDoc.data().answer);
  }

  // expiration set
  const expiration = Timestamp.fromMillis(Timestamp.now().toMillis() + lobbyData.lobbySettings.chatTime * 1000);
  transaction.update(lobbyDoc.ref, { state: "CHAT", expiration });

  const { pairs, stalker } = generatePairs(lobbyData);

  if (stalker != undefined) {
    const stalkerPrivatePlayer = getPrivatePlayerCollection(lobbyDoc.ref).doc(stalker);

    // make player the stalker
    transaction.update(stalkerPrivatePlayer, { stalker: true });
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
      timestamp: Timestamp.now(),
      isPromptAnswer: true,
    });
    const messageRef2 = getChatRoomMessagesCollection(roomRef).doc(two);
    transaction.create(messageRef2, {
      sender: two,
      text: twoAnswer,
      timestamp: Timestamp.now(),
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

    const { players, skipVote: oldSkipVote } = lobbyData;
    let skipVote = oldSkipVote;

    // decrement old target
    if (oldVoteDoc != undefined && oldVoteDoc.target == null) {
      skipVote -= 1;
    } else if (oldVoteDoc != undefined && oldVoteDoc.target != null) {
      const oldTarget = players[oldVoteDoc.target];
      if (oldTarget.votes != 0) {
        oldTarget.votes -= 1;
      }
    }

    // increment new target
    if (latestVoteDoc.target == null) {
      skipVote += 1;
    } else {
      players[latestVoteDoc.target].votes += 1;
    }

    let totalVotes = 0;
    let livingPlayers = 0;
    for (const uid in players) {
      totalVotes += players[uid].votes;
    }
    totalVotes += skipVote;

    for (const uid in lobbyData.players) {
      if (lobbyData.players[uid].alive) {
        livingPlayers++;
      }
    }

    if (totalVotes == livingPlayers && lobbyData.expiration.toMillis() > Timestamp.now().toMillis() + 10 * 1000) {
      const expiration = Timestamp.fromMillis(Timestamp.now().toMillis() + 10 * 1000);
      transaction.update(lobbyDocRef, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
        players: players satisfies Lobby["players"] as any,
        skipVote,
        expiration,
      });
    } else {
      transaction.update(lobbyDocRef, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
        players: players satisfies Lobby["players"] as any,
        skipVote,
      });
    }
  });
});

export const verifyExpiration = functions.https.onCall(async (data, context): Promise<void> => {
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
  let lobby: Lobby | undefined;

  // start transaction
  await db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyDocRef);
    lobby = lobbyDoc.data();
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

    switch (lobby.state) {
      case "ROLE":
        await startPrompt(lobbyDoc, transaction);
        break;
      case "PROMPT":
        await collectPromptAnswers(lobbyDoc, transaction);
        break;
      case "CHAT":
        await setAndDeleteAnswers(lobby, lobbyDocRef, transaction);
        break;
      case "END":
        await endGameProcess(lobby, lobbyDocRef, transaction);
        break;
      case "VOTE":
        findVoteOff(lobby, lobbyDocRef, transaction);
        break;
      case "RESULT":
        await determineWinner(lobbyDoc, transaction);
        break;
      default:
        throw new functions.https.HttpsError("failed-precondition", "Lobby is in an invalid state.");
    }
  });

  if (lobby?.state == "CHAT") {
    await deleteChatCollections(lobbyDocRef);
  }

  if (lobby?.state == "VOTE") {
    await deleteLobbyChatMessages(lobbyDocRef);
  }
});
