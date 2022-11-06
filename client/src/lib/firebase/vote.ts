import { doc, setDoc } from "firebase/firestore";
import { getVoteCollection } from "./firestore-collections";

export function addVote(lobbyCode: string, userId: string, target: string) {
  setDoc(doc(getVoteCollection(lobbyCode), userId), {
    target,
  });
}
