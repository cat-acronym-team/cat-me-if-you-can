<script lang="ts">
  import LobbyComponent from "$components/Lobby.svelte";
  import Chat from "$components/Chat.svelte";
  import { onMount } from "svelte";
  import { doc, getDoc, onSnapshot } from "firebase/firestore";
  import { page } from "$app/stores";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";

  let lobbyData: Lobby;
  let code: string;
  onMount(async () => {
    code = $page.params.gameid;
    const lobbyDoc = await getDoc(doc(lobbyCollection, code));
    lobbyData = lobbyDoc.data() as Lobby;
    onSnapshot(lobbyDoc.ref, (doc) => {
      lobbyData = doc.data() as Lobby;
    });
  });
</script>

{#if lobbyData !== undefined}
  <div>
    {#if lobbyData.state === "WAIT"}
      <LobbyComponent />
    {:else if lobbyData.state === "CHAT"}
      <Chat lobbyData={{ ...lobbyData, id: code }} />
    {/if}
  </div>
{/if}
