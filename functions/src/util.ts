import { Timestamp } from "firebase-admin/firestore";
import { Lobby, Player } from "./firestore-types/lobby";

export type GeneratedPairs = {
  pairs: { one: string; two: string }[];
  stalker?: string;
};

export function generatePairs(lobbyData: Lobby): GeneratedPairs {
  const pairs: GeneratedPairs["pairs"] = [];
  let stalker: string | undefined;

  // get only the uids of alive players
  const aliveUids: string[] = [];

  for (const uid in lobbyData.players) {
    if (lobbyData.players[uid].alive) {
      aliveUids.push(uid);
    }
  }

  // pairs up on the alive players
  while (aliveUids.length > 1) {
    // get random pair
    const [one] = aliveUids.splice(Math.floor(Math.random() * aliveUids.length), 1);
    const [two] = aliveUids.splice(Math.floor(Math.random() * aliveUids.length), 1);
    // organize the pairs
    pairs.push({ one, two });
  }

  // Make this guy a stalker somehow
  if (aliveUids.length !== 0) {
    stalker = aliveUids[0];
  }

  return { pairs, stalker };
}

export function updateHost(players: { [uid: string]: Player }) {
  let newHost: string | undefined;
  let earliestJoinedTime = Timestamp.now().toMillis();

  for (const uid in players) {
    const currentPlayerTimeJoined = players[uid].timeJoined.toMillis();

    if (currentPlayerTimeJoined < earliestJoinedTime) {
      earliestJoinedTime = currentPlayerTimeJoined;
      newHost = uid;
    }
  }

  return newHost;
}
