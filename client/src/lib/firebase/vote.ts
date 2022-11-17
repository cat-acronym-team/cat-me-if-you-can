import { doc, setDoc } from "firebase/firestore";
import { getVoteCollection } from "./firestore-collections";

export async function addVote(lobbyCode: string, userId: string, target: string, alive: boolean) {
  if (alive === true) {
    await setDoc(doc(getVoteCollection(lobbyCode), userId), {
      target,
    });
  }
}
