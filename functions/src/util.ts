import { GeneratedPairs } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";

export function generatePairs(lobbyData: Lobby): GeneratedPairs {
  const pairs: { one: string; two: string }[] = [];
  let pairOne, pairTwo;
  let stalker: string | undefined;

  // Check if the lobby is uneven to find stalker
  while (lobbyData.uids.length > 1) {
    // get random pair
    pairOne = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
    pairTwo = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
    // generate a random player if the current pairs are equal
    do {
      pairTwo = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
    } while (pairOne === pairTwo);
    // organize the pairs
    pairs.push({ one: pairOne, two: pairTwo });
    // delete them from temp array
    lobbyData.uids.splice(lobbyData.uids.indexOf(pairOne), 1);
    lobbyData.uids.splice(lobbyData.uids.indexOf(pairTwo), 1);
  }
  // Make this guy a stalker somehow
  if (lobbyData.uids.length !== 0) {
    stalker = lobbyData.uids[0];
  }

  return { pairs, stalker };
}
