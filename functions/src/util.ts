import { Lobby } from "./firestore-types/lobby";

export type GeneratedPairs = {
  pairs: { one: string; two: string }[];
  stalker?: string;
};

export function generatePairs(lobbyData: Lobby): GeneratedPairs {
  const pairs: GeneratedPairs["pairs"] = [];
  let stalker: string | undefined;

  // get only the uids of alive players
  const aliveUids: string[] = [];
  lobbyData.players.forEach((player, playerIndex) => {
    if (player.alive) {
      aliveUids.push(lobbyData.uids[playerIndex]);
    }
  });

  // pairs up on the alive players
  while (aliveUids.length > 1) {
    // get random pair
    const one = aliveUids[Math.floor(Math.random() * aliveUids.length)];
    let two: string;
    // generate a random player if the current pairs are equal
    do {
      two = aliveUids[Math.floor(Math.random() * aliveUids.length)];
    } while (one === two);
    // organize the pairs
    pairs.push({ one, two });
    // delete them from array
    aliveUids.splice(aliveUids.indexOf(one), 1);
    aliveUids.splice(aliveUids.indexOf(two), 1);
  }

  // Make this guy a stalker somehow
  if (aliveUids.length !== 0) {
    stalker = aliveUids[0];
  }

  return { pairs, stalker };
}
