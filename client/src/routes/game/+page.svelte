<script lang="ts">
  import LobbyComponent from "$components/Lobby.svelte";
  import { onSnapshot, doc } from "firebase/firestore";
  import { onMount } from "svelte";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { auth } from "$lib/firebase/app";
  import { goto } from "$app/navigation";
  import { getUser } from "$lib/firebase/splash";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { findAndJoinLobby } from "$lib/firebase/join-lobby";

  let lobbyData: Lobby = {
    uids: [],
    players: [],
    state: "WAIT",
  };
  const { currentUser } = auth;
  let code: string;
  onMount(async () => {
    code = $page.url.search.split("=")[1];
    if (currentUser === null) {
      goto(`/join?code=${code}`, {
        replaceState: true,
      });
    } else {
      // subscribes the lobby
      onSnapshot(doc(lobbyCollection, code), (doc) => {
        // will change lobbyData to the new doc data
        lobbyData = doc.data() as Lobby;
      });
      // If the lobby does not include the player trying to join, Add them to the lobby. This should only apply to players joining off a direct link
      if (!lobbyData.uids.includes(currentUser.uid)) {
        const { displayName, avatar } = (await getUser(currentUser.uid)) as UserData;
        try {
          // enter lobby with the user's info
          await findAndJoinLobby(code, {
            displayName,
            avatar,
            uid: currentUser.uid,
          });
        } catch (err: any) {
          if (err.message == "You are already in the lobby!") {
            return;
          }
          if (err.message == "Lobby doesn't exist!") {
            goto(`/game?=${code}`);
          }
        }
      }
    }
  });
</script>

<div>
  {#if lobbyData.state === "WAIT"}
    <LobbyComponent {code} players={lobbyData.players} />
  {:else if lobbyData.state === "PROMPT"}
    <p>PROPMPT PAGE</p>
  {/if}
</div>
