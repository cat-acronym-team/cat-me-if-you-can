import { firestore } from "firebase-admin";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { GAME_STATE_DURATIONS, Lobby, Player } from "./firestore-types/lobby";

export function findVoteOff(lobbyData: Lobby, lobbyDocRef: DocumentReference<Lobby>, transaction: Transaction) {
  const { players } = lobbyData;
  let votedOff: string | undefined = undefined;

  // find the player with the most votes
  let most: Player | null = null;
  let mostValue = 0;

  for (const uid in lobbyData.players) {
    if (players[uid].votes > mostValue) {
      most = players[uid];
      mostValue = most.votes;
    } else if (players[uid].votes == mostValue) {
      most = null;
    }
  }

  // if they're not equal then most is voted off
  if (most != null) {
    // find index of most in the players array
    let mostUID: string | undefined;
    for (const uid in lobbyData.players) {
      const player = players[uid];
      if (player.votes == most.votes) {
        mostUID = uid;
      }
    }
    // replace the shallow one copy object with the deep copy object changes
    if (mostUID != undefined) {
      players[mostUID].alive = false;
      // save their name
      votedOff = mostUID;
    }
  }

  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS.RESULT * 1000
  );
  // update the state of the game
  transaction.update(lobbyDocRef, {
    state: "RESULT",
    votedOff: votedOff ?? "NONE",
    players: players,
    expiration,
  });
}
