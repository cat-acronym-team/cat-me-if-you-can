import { GeneratedPairs } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";

export function generatePairs(lobbyData: Lobby): GeneratedPairs {
  const pairs: GeneratedPairs["pairs"] = [];
  let stalker: string | undefined;
  
  // get only the uids of alive players
  let aliveUids: string[] = [];
  lobbyData.players.forEach((player, playerIndex) => {
    if (player.alive) {
      aliveUids.push(lobbyData.uids[playerIndex]);
    }
  });

  // pairs up on the alive players
  while (aliveUids.length > 1) {
    // get random pair
    const one = aliveUids[Math.floor(Math.random() * aliveUids.length)];
    let two = aliveUids[Math.floor(Math.random() * aliveUids.length)];
    // generate a random player if the current pairs are equal
    do {
      two = aliveUids[Math.floor(Math.random() * aliveUids.length)];
    } while (one === two);
    // organize the pairs
    pairs.push({ one, two });
    // delete them from array
    aliveUids = aliveUids.filter((uid) => {
      return ![one, two].includes(uid);
    });
  }

  // Make this guy a stalker somehow
  if (aliveUids.length !== 0) {
    stalker = aliveUids[0];
  }

  return { pairs, stalker };
}
