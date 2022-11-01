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
