import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import type { Lobby } from "$lib/firebase/firestore-types/lobby";
import { lobbyCollection } from "$lib/firebase/firestore-collections";
import { getVoteCollection } from "$lib/firebase/firestore-collections";

export async function vote(person: number, lobbyData: Lobby, code: string, uid: string) {
  const lobby = doc(lobbyCollection, code);
  const player = lobbyData.players[person];

  if (player.votes !== undefined) {
    player.votes = player.votes + 1;
  }
  const { players } = lobbyData;
  const newPlayers = players;
  newPlayers[person] = player;
  updateDoc(lobby, {
    players: newPlayers,
  });

  const targ = await getDoc(doc(getVoteCollection(lobby), uid));
  const current = targ.data();
  console.log(uid);
  console.log(current);

  if (current !== undefined) {
    const previous = current.target;
    const index = lobbyData.uids.indexOf(previous);
    console.log(previous);
    const oldPlayer = lobbyData.players[index];
    if (oldPlayer.votes !== undefined) {
      oldPlayer.votes = oldPlayer.votes - 1;
    }

    const oldPlayers = players;
    oldPlayers[index] = oldPlayer;
    updateDoc(lobby, {
      players: oldPlayers,
    });
  }
  await setDoc(doc(getVoteCollection(lobby), uid), {
    target: uid,
  });
}
