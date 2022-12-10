import { firestore } from "firebase-admin";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { GAME_STATE_DURATIONS_DEFAULT, Lobby } from "./firestore-types/lobby";

export function findVoteOff(lobbyData: Lobby, lobbyDocRef: DocumentReference<Lobby>, transaction: Transaction) {
  const { players } = lobbyData;
  let votedOff: string | undefined = undefined;

  // find the player with the most votes
  let most: string | null = null;
  let mostValue = 0;

  for (const uid in lobbyData.players) {
    if (players[uid].votes > mostValue) {
      most = uid;
      mostValue = players[uid].votes;
    } else if (players[uid].votes == mostValue) {
      most = null;
    }
  }

  // if they're not equal then most is voted off
  if (most != null) {
    // replace the shallow one copy object with the deep copy object changes
    if (most != undefined) {
      players[most].alive = false;
      // save their uid
      votedOff = most;
    }
  }

  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS_DEFAULT.RESULT * 1000
  );
  // update the state of the game
  transaction.update(lobbyDocRef, {
    state: "RESULT",
    votedOff: votedOff ?? "NONE",
    players: players,
    expiration,
  });
}
