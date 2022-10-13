<!-- <script lang="ts">
  import type { PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { getPrivatePlayerCollection } from "./firestore-collections";
  import { doc, setDoc, getDoc } from "firebase/firestore";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import { page } from "$app/stores";
  import { getAuth } from "firebase/auth";

  var numCatFish = 0;
  var check: number[];
  var current = 0;
  let code: string;

  code = $page.url.search.split("=")[1];
  const auth = getAuth();
  const user = auth.currentUser;
  const userID = user!.uid;
  // gets the current user's ID

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

    // trying to get the current users role
    const getRole = doc(getPrivatePlayerCollection(), userID);
    const getRoleDoc = getDoc(getRole);

    let data = (await getRoleDoc).data();
    const currentRole = data!.role;
  }
</script> -->

<body>
  <div class = "container">
    <div class = "header">
      Time to find your purrfect match!
    </div>
    <div class = "role">
      You are a <span>(role)<!--<b>{currentRole}</b> --></span>
      <p><i>Insert Image</i></p>
    </div>
  </div>
</body>

<style>
  .container {
    position: relative;
    height: 100vh;
  }

  .header {
    position: absolute;
    width: 50%;
    height: 10%;
    font-size: 4em;
    font-weight: bold;
    left: 25%;
    top: 10%;
    text-align: center;
  }

  .role {
    position: absolute;
    width: 20%;
    height: 30%;
    left: 40%;
    top: 25%;
    font-size: 4em;
    text-align: center;
  }

  p  {
    position: absolute;
    width: 80%;
    left: 10%;
    top: 40%;
    border: 2px solid black;
    height: 80%;
    color: blue;
  }

  span {
    color: red;
  }
</style>
