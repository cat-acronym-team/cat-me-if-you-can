<script lang="ts">
  import LobbyChat from "./LobbyChat.svelte";
  import SelectAvatar from "./SelectAvatar.svelte";
  import { page } from "$app/stores";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { startGame } from "$lib/firebase/firestore-functions";

  // Props
  export let lobbyCode: string;
  export let lobby: Lobby;

  // better link to share since it's redirecting to this page anyways
  // Josh's suggestion that I agreed on
  let url = `${$page.url.origin}/join?code=${lobbyCode}`;
  let canShare = false;
  // Allows for shareable data with text description
  const shareableData = {
    title: "Cat Me if you Can!",
    text: "Join us in a game of Cat Me if you Can!",
    url,
  };

  // Shares link with other players through click event
  async function share() {
    await navigator.share(shareableData);
  }

  onMount(() => {
    canShare = navigator.canShare?.(shareableData);
  });

  // Copies URL to clipboard on click
  function copyLink() {
    navigator.clipboard.writeText(url);
  }
</script>

<main>
  <div class="container">
    <div class="lobby-info">
      <h3>Code: {lobbyCode}</h3>
      <h3>Players: {lobby.players.length}</h3>
    </div>
    <div class="lobbyChat-level">
      <LobbyChat />
    </div>
    <SelectAvatar {lobby} {lobbyCode} />
    <div class="start">
      <button
        id="start-game"
        on:click={async () => {
          startGame({ code: lobbyCode });
        }}>Start Game</button
      >
    </div>
    <div class="buttons">
      <h3 class="invite-link">Invite Link: {url}</h3>
      <button id="copy" on:click={copyLink}>Copy Link</button>
      {#if canShare}<button id="share" on:click={share}>Share Link</button>{/if}
    </div>
  </div>
</main>

<style>
  main {
    justify-content: center;
  }

  #start-game {
    width: 100px;
    height: 35px;
  }

  .start {
    display: grid;
    place-items: center;
  }

  .buttons {
    display: grid;
    grid-template-columns: 1fr auto auto;
  }

  .invite-link {
    margin: 0;
  }
  .lobbyChat-level {
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
  }
</style>
