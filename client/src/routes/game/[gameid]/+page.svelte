<script lang="ts">
  import LobbyComponent from "$components/Lobby.svelte";
  import { onSnapshot, doc } from "firebase/firestore";
  import { onMount } from "svelte";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { changeGameState } from "$lib/firebase/game";

  // will hold the real time lobby data
  let lobbyData: Lobby = {
    uids: [],
    players: [],
    state: "WAIT",
  };
  onMount(async () => {
    // subscribes the lobby
    onSnapshot(doc(lobbyCollection, $page.params.gameid), (doc) => {
      // will change lobbyData to the new doc data
      lobbyData = doc.data() as Lobby;
    });
  });
</script>

<div>
  <LobbyComponent
    players={lobbyData.players}
    startGame={() => {
      // TODO: Change Game State From Waiting to the Next
      changeGameState($page.params.gameid, "");
    }}
  />
</div>
