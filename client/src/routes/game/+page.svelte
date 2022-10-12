<script lang="ts">
  import LobbyComponent from "$components/Lobby.svelte";
  import { onSnapshot, doc } from "firebase/firestore";
  import { onMount } from "svelte";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { auth } from "$lib/firebase/app";

  let lobbyData: Lobby = {
    uids: [],
    players: [],
    state: "WAIT",
  };
  const { currentUser } = auth;
  let code:string;
  onMount(async () => {
    code = $page.url.search.split("=")[1];
    // subscribes the lobby
    onSnapshot(doc(lobbyCollection, code), (doc) => {
      // will change lobbyData to the new doc data
      lobbyData = doc.data() as Lobby;
    });
  });
</script>

<div>
  {#if lobbyData.state === "WAIT"}
    <LobbyComponent {code} players={lobbyData.players} />
  {:else if lobbyData.state === "PROMPT"}
    <p>PROPMPT PAGE</p>
  {/if}
</div>
