import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { Lobby, Player } from "./firestore-types/lobby";

export function findVoteOff(lobbyData: Lobby, lobbyDocRef: DocumentReference<Lobby>, transaction: Transaction) {
  const { players } = lobbyData;
  let votedOff: string | false = false;

  // find the player with the most votes
  const [most, secondMost]: Player[] = JSON.parse(JSON.stringify(players)).sort((a: Player, b: Player) => {
    if (a.votes == undefined) {
      a.votes = 0;
    }
    if (b.votes == undefined) {
      b.votes = 0;
    }

    return b.votes - a.votes;
  });
  // if they're not equal then most is voted off
  if (most.votes != secondMost.votes) {
    // find index of most in the players array
    let mostIndex: number | undefined;
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (
        player.alive == most.alive &&
        player.avatar == most.avatar &&
        player.displayName == most.displayName &&
        player.promptAnswer == most.promptAnswer &&
        player.votes == most.votes
      ) {
        mostIndex = i;
      }
    }
    // kill the player
    most.alive = false;
    // replace the shallow one copy object with the deep copy object changes
    if (mostIndex != undefined) {
      players[mostIndex] = most;
    }
    // save their name
    votedOff = most.displayName;
  }

  // update the state of the game
  transaction.update(lobbyDocRef, {
    state: "RESULT",
    players: players,
    votedOff: votedOff == false ? "NONE" : votedOff,
  });
}
