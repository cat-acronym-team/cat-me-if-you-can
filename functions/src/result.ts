import { firestore } from "firebase-admin";
import type { DocumentSnapshot, Transaction } from "firebase-admin/firestore";
import { getPrivatePlayerCollection, getVoteCollection } from "./firestore-collections";
import { GAME_STATE_DURATIONS_DEFAULT, Lobby, Role } from "./firestore-types/lobby";
import { startPrompt } from "./lobby";

export async function determineWinner(lobbyDoc: DocumentSnapshot<Lobby>, transaction: Transaction) {
  const lobbyData = lobbyDoc.data();

  if (lobbyData == undefined) {
    throw new Error("Lobby not found");
  }

  const { players } = lobbyData;
  let winner: Role | undefined;

  // check the alive cats vs alive catfishes
  let aliveCats = 0;
  let aliveCatfishes = 0;
  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDoc.ref);

  for (const uid in players) {
    const privatePlayerRef = privatePlayerCollection.doc(uid);

    const privatePlayerDoc = await transaction.get(privatePlayerRef);

    const privatePlayer = privatePlayerDoc.data();

    if (privatePlayer == undefined) {
      continue;
    } else {
      const player = players[uid];

      if (privatePlayer.role == "CAT" && player.alive) {
        aliveCats += 1;
      }
      if (privatePlayer.role == "CATFISH" && player.alive) {
        aliveCatfishes += 1;
      }
      // add their role to their altered player object
      player.role = privatePlayer.role;
    }
  }
  // if the game is ended then add the winner property and the roles of the players
  if (aliveCats <= aliveCatfishes) {
    winner = "CATFISH";
  }
  if (aliveCatfishes == 0) {
    winner = "CAT";
  }

  // if there's no winner clear out the votes for the current player
  if (winner == undefined) {
    // set their votes to zero
    for (const uid in players) {
      players[uid].votes = 0;
    }
  }

  // remove their vote document
  const voteCollection = getVoteCollection(lobbyDoc.ref);
  const voteDocs = await transaction.get(voteCollection);

  // update the lobby doc with the new information
  if (winner != undefined) {
    // END
    const expiration = firestore.Timestamp.fromMillis(
      firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS_DEFAULT.END * 1000
    );
    transaction.update(lobbyDoc.ref, { state: "END", players, winner, expiration });
  } else {
    // PROMPT
    await startPrompt(lobbyDoc, transaction);
    transaction.update(lobbyDoc.ref, { players });
  }

  for (const voteDoc of voteDocs.docs) {
    transaction.delete(voteDoc.ref);
  }
}
