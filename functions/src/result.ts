import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { getPrivatePlayerCollection, getVoteCollection } from "./firestore-collections";
import { Lobby, Player, Role } from "./firestore-types/lobby";

export async function determineWinner(
  lobbyData: Lobby,
  lobbyDocRef: DocumentReference<Lobby>,
  transaction: Transaction
) {
  const { uids } = lobbyData;
  let { players: currentPlayers } = lobbyData;
  let winner: Role | undefined;
  const alteredPlayers: Player[] = JSON.parse(JSON.stringify(currentPlayers));

  // check the alive cats vs alive catfishes
  let aliveCats = 0;
  let aliveCatfishes = 0;
  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

  for (const uid of uids) {
    const privatePlayerRef = privatePlayerCollection.doc(uid);

    const privatePlayerDoc = await transaction.get(privatePlayerRef);

    const privatePlayer = privatePlayerDoc.data();

    if (privatePlayer == undefined) {
      continue;
    } else {
      const player = alteredPlayers[uids.indexOf(uid)];

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
    currentPlayers = currentPlayers.map((player) => {
      player.votes = 0;
      return player;
    });
    // remove their vote document
    const voteCollection = getVoteCollection(lobbyDocRef);
    const voteDocs = await transaction.get(voteCollection);
    await Promise.all(voteDocs.docs.map((voteSnap) => transaction.delete(voteSnap.ref)));
  }

  // update the lobby doc with the new information
  transaction.update(lobbyDocRef, {
    state: winner != undefined ? "END" : "PROMPT",
    players: winner != undefined ? alteredPlayers : currentPlayers,
    winner,
  });
}
