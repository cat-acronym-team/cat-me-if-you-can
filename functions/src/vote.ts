import { Timestamp } from "firebase-admin/firestore";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { GAME_STATE_DURATIONS_DEFAULT, Lobby } from "./firestore-types/lobby";

export function findVoteOff(lobbyData: Lobby, lobbyDocRef: DocumentReference<Lobby>, transaction: Transaction) {
  const { players } = lobbyData;
  let votedOff: string | undefined = undefined;

  // find the player with the most votes
  let most: string | null = null;
  let mostValue = lobbyData.skipVote;

  for (const uid in lobbyData.players) {
    if (players[uid].votes > mostValue) {
      most = uid;
      mostValue = players[uid].votes;
    } else if (players[uid].votes == mostValue) {
      most = null;
    }
  }

  // If most is not null then vote off the player with the most votes
  if (most != null) {
    players[most].alive = false;
    // save their uid
    votedOff = most;
  }

  const expiration = Timestamp.fromMillis(Timestamp.now().toMillis() + GAME_STATE_DURATIONS_DEFAULT.RESULT * 1000);
  // update the state of the game
  transaction.update(lobbyDocRef, {
    state: "RESULT",
    votedOff: votedOff ?? "NONE",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
    players: players satisfies Lobby["players"] as any,
    expiration,
  });
}
