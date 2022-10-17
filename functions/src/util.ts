import { Lobby } from "./firestore-types/lobby";

export function generatePairs(lobbyData: Lobby) {
  const pairs: { one: string; two: string }[] = [];
  let pairOne, pairTwo;
  // stalker: string;

  // Check if the lobby is uneven to find stalker
  if (lobbyData.uids.length % 2 !== 0) {
    while (lobbyData.uids.length !== 1) {
      // get random pair
      pairOne = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
      pairTwo = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
      // generate a random player if the current pairs are equal
      while (pairOne === pairTwo) {
        pairTwo = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
      }
      // organize the pairs
      pairs.push({ one: pairOne, two: pairTwo });
      // delete them from temp array
      lobbyData.uids.splice(lobbyData.uids.indexOf(pairOne), 1);
      lobbyData.uids.splice(lobbyData.uids.indexOf(pairTwo), 1);
    }
    // TODO: Make this guy a stalker somehow
    // stalker = lobbyData.uids[0];
  }
  // even number of players
  else {
    while (lobbyData.uids.length !== 0) {
      // get random pair
      pairOne = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
      pairTwo = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
      // generate a random player if the current pairs are equal
      while (pairOne === pairTwo) {
        pairTwo = lobbyData.uids[Math.floor(Math.random() * lobbyData.uids.length)];
      }
      // organize the pairs
      pairs.push({ one: pairOne, two: pairTwo });
      // delete them from temp array
      lobbyData.uids.splice(lobbyData.uids.indexOf(pairOne), 1);
      lobbyData.uids.splice(lobbyData.uids.indexOf(pairTwo), 1);
    }
  }

  return pairs;
}
