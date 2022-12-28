import { Timestamp } from "firebase-admin/firestore";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { GAME_STATE_DURATIONS_DEFAULT, Lobby, Player } from "./firestore-types/lobby";

export function findVoteOff(lobbyData: Lobby, lobbyDocRef: DocumentReference<Lobby>, transaction: Transaction) {
  const { players, uids } = lobbyData;
  let votedOff: string | undefined = undefined;

  // find the player with the most votes
  const [most, secondMost]: Player[] = JSON.parse(JSON.stringify(players)).sort((a: Player, b: Player) => {
    return b.votes - a.votes;
  });
  // if they're not equal and have less votes than skip then most is voted off
  if (most.votes != secondMost.votes && most.votes > lobbyData.skipVote) {
    // find index of most in the players array
    let mostIndex: number | undefined;
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (player.votes == most.votes) {
        mostIndex = i;
      }
    }
    // replace the shallow one copy object with the deep copy object changes
    if (mostIndex != undefined) {
      players[mostIndex].alive = false;
      // save their name
      votedOff = uids[mostIndex];
    }
  }
  const expiration = Timestamp.fromMillis(Timestamp.now().toMillis() + GAME_STATE_DURATIONS_DEFAULT.RESULT * 1000);
  // update the state of the game
  transaction.update(lobbyDocRef, {
    state: "RESULT",
    votedOff: votedOff ?? "NONE",
    players: players,
    expiration,
  });
}
