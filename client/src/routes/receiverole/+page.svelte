<script lang="ts">
  import type { PrivatePlayer } from "./firestore-types/lobby";
  import { getPrivatePlayerCollection } from "./firestore-collections";
  import { doc, setDoc, getDoc } from "firebase/firestore";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import { page } from "$app/stores";

  var numCatFish = 0;
  var check: number[];
  var current = 0;
  let code: string;

  code = $page.url.search.split("=")[1];

  async function assignRole() {
    const lobby = doc(lobbyCollection, code);
    const validLobby = await getDoc(lobby);

    if (!validLobby.exists()) {
      throw new Error("Invalid Lobby");
    }

    const { uids } = validLobby.data();

    for (let i = 0; i < numCatFish; i++) {
      current = Math.floor(Math.random() * (uids.length - 1) + 0);
      if (check.indexOf(current) === -1) {
        check.push(current);
      } else i--;
    }
    for (let j = 0; j < uids.length; j++) {
      if (check.indexOf(j) === -1) {
        await setDoc(doc(getPrivatePlayerCollection(), uids[j]), {
          role: "CAT" as PrivatePlayer["role"],
        });
      } else {
        await setDoc(doc(getPrivatePlayerCollection(), uids[j]), {
          role: "CATFISH" as PrivatePlayer["role"],
        });
      }
    }
  }
</script>
