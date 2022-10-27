import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { db } from "./app";
import {
  getPrivatePlayerCollection,
  getPromptAnswerCollection,
  lobbyCollection,
  userCollection,
} from "./firestore-collections";
import { avatars, Lobby, Role } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import { isLobbyRequest } from "./firestore-functions-types";
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

  const privatePlayerCollection = getPrivatePlayerCollection(lobby.ref);
  for (const uid of uids) {
    privatePlayerCollection.doc(uid).create({ role: "CAT" });
  }

  return lobbyCollection.doc(data.code).update({ state: "PROMPT" });
});

export const joinLobby = functions.https.onCall((data: unknown, context) => {
  const auth = context.auth;
  // no auth then you shouldn't be here
  if (auth === undefined) {
    return { error: "Not Signed In" };
  }
  // validate code
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }

  return db.runTransaction(async (transaction) => {
    // lobby doc
    const lobby = lobbyCollection.doc(data.code);
    const lobbyInfo = await transaction.get(lobby);
    // extra validation to make sure it exist
    if (lobbyInfo.exists === false) {
      return { error: "Lobby doesn't exist!" };
    }
    // user doc
    const user = await transaction.get(userCollection.doc(auth.uid));
    // make sure this user has a doc with a displayName and avatar
    if (user.exists === false) {
      return { error: "You need to have a displayName and avatar!" };
    }
    // user data
    const userInfo = user.data() as UserData;

    // get lobby data
    const { players, uids } = lobbyInfo.data() as Lobby;
    if (uids.includes(auth.uid)) {
      return { error: "You are already in the lobby!" };
    }

    // change avatar randomly if it is already taken
    const takenAvatars = players.map((player) => player.avatar);
    while (userInfo.avatar == 0 || takenAvatars.includes(userInfo.avatar)) {
      userInfo.avatar = avatars[Math.floor(Math.random() * avatars.length)];
    }

    // add player
    return transaction.update(lobby, {
      players: [...players, { ...userInfo, alive: true }],
      uids: [...uids, auth.uid],
    });
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

  if (lobby.state == "END" && oldLobby.state != "END") {
    addRole(lobbyDocRef);
  }

  if (lobby.state == "WAIT" && oldLobby.state == "END") {
    makeAlive(lobbyDocRef);
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

      functions.logger.log(promptAnswers);

      // TODO #32 create a one on one chat and store the promptAnswers in it
    });
  });

export async function addRole(lobbyDocRef: firestore.DocumentReference<Lobby>) {
  const lobby = await lobbyDocRef.get();
  if (lobby.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }
  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);
  const privatePlayers = (await privatePlayerCollection.get()).docs;

  const { players, uids } = lobby.data() as Lobby;

  for (let i = 0; i < players.length; i++) {
    //  private player id = user uid
    const privateId = privatePlayers[i].id;
    // private player info
    const privateInfo = privatePlayers[i].data();
    // get player
    const player = players[uids.indexOf(privateId)];
    // replace the role of the player
    player.role = privateInfo.role;
  }
  let catCount = 0;
  let catfishCount = 0;
  const catfishDisplayname: string[] = [];
  for (let i = 0; i < uids.length; i++) {
    // check the alive players
    if (players[i].alive == true) {
      if (players[i].role == "CAT") {
        catCount++;
        // within the alive players, count the number that are cats
      } else {
        let temp = "";
        temp = players[i].displayName;
        catfishCount++;
        catfishDisplayname.push(temp);
      }
    }
    // check any catfish who are not alive and add their display name to the list
    else {
      if (players[i].role == "CATFISH") {
        let temp = "";
        temp = players[i].displayName;
        catfishDisplayname.push(temp);
      }
    }
  }

  let winner: Role | undefined;
  if (catfishCount == 0) {
    winner = "CAT";
  }
  if (catCount <= catfishCount) {
    winner = "CATFISH";
  }

  return lobbyDocRef.update({ players, winner });
}

// when returning to the lobby, make every player alive again
export async function makeAlive(lobbyDocRef: firestore.DocumentReference<Lobby>) {
  const lobby = await lobbyDocRef.get();
  if (lobby.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }

  const { players } = lobby.data() as Lobby;
  for (let i = 0; i < players.length; i++) {
    players[i].alive = true;
  }
  return lobbyDocRef.update({ players });
}
