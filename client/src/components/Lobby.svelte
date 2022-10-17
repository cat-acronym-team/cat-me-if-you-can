<script lang="ts">
  import { page } from "$app/stores";
  import type { Player } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { startGame } from "$lib/firebase/firestore-functions";

  // Props
  export let players: Player[];
  export let code: string;
  // better link to share since it's redirecting to this page anyways
  // Josh's suggestion that I agreed on
  let url = `${$page.url.origin}/join?code=${code}`;
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

<link href="http://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css" />
<main>
  <div class="container">
    <div class="lobby-info">
      <h3>Code: {code}</h3>
      <h3>Players: {players.length}</h3>
    </div>
    <!-- TODO: Probably Display Users with their avatar and name -->
    <div class="lobby" />
    <div class="start">
      <button
        id="start-game"
        on:click={async () => {
          startGame({ code });
        }}>Start Game</button
      >
    </div>
    <div class="invite-link">
      <h3>Invite Link: {url}</h3>
    </div>
    <div class="copy-button">
      <button id="copy" on:click={copyLink}>Copy Link</button>
    </div>
    <div class="share-button">
      {#if canShare}
        <button id="share" on:click={share}>Share Link</button>
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    justify-content: center;
  }

  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    gap: 0px 0px;
    grid-template-areas:
      ". . . . . . ."
      ". lobby-info lobby-info lobby-info lobby-info lobby-info ."
      ". lobby lobby lobby lobby lobby ."
      ". lobby lobby lobby lobby lobby ."
      ". lobby lobby lobby lobby lobby ."
      ". . . start . . ."
      ". . . invite-link copy-button share-button .";
  }
  .lobby {
    grid-area: lobby;
    border: 2px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 500px;
  }

  #start-game {
    width: 100px;
    height: 35px;
  }

  .start {
    grid-area: start;
    position: relative;
    left: 50%;
  }

  .lobby-info {
    grid-area: lobby-info;
  }

  .invite-link {
    grid-area: invite-link;
    width: 750px;
    height: 100px;
  }

  .copy-button {
    grid-area: copy-button;
  }

  .share-button {
    grid-area: share-button;
  }
</style>
