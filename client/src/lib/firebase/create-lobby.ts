import { doc, setDoc } from "firebase/firestore";
import { lobbyCollection } from "./firestore-collections";
import { auth } from "./app";
import { loginAnonymous } from "./auth";

export async function createLobby(): Promise<string> {
  let user = auth.currentUser?.uid;

  if (user == undefined) {
    user = (await loginAnonymous()).user.uid;
  }

  for (let index = 0; index < 5; index++) {
    const code = createCode(); // Creates lobby code
    try {
      await setDoc(doc(lobbyCollection, code), {
        uids: [user.toString()],
        players: [
          {
            alive: true,
            avatar: 1,
            displayName: "default",
          },
        ],
        state: "WAIT",
      });

      return code;
    } catch (error) {
      continue;
    }
  }
  throw new Error("Cannot create document. Maximum number of tries exceeded");
}

const characters = "abcdefghijklmnopqrstuvwxyz";

function createCode() {
  let code = "";
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return code;
}
