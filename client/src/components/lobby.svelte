<script lang="ts">
  import SelectAvatar from "./select-avatar.svelte";
  import { page } from "$app/stores";

  let code = $page.params.gameid;
  let url = window.location.href;

  import type { Lobby } from "$lib/firebase/firestore-types/lobby";

  const lobby: Lobby = {
    uids: ["nate", "nathan"],
    players: [
      { alive: true, displayName: "Nate", avatar: 5 },
      { alive: true, displayName: "Nathan", avatar: 3 },
      { alive: true, displayName: "HHHHHHHHHH", avatar: 9 },
    ],
    state: "WAIT",
  };

  function startgame() {
    return; // TODO: Placeholder return statement
  }
</script>

<link href="http://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css" />
<main>
  <div class="container">
    <div class="lobby-info">
      <h3>Code: {code}</h3>
      <h3>Players:</h3>
    </div>
    <div class="lobby"><SelectAvatar {lobby} /></div>
    <div class="start">
      <button id="start-game" on:click={startgame}>Start Game</button>
    </div>
    <div class="invite-link">
      <h3>Invite Link: {url}</h3>
    </div>
    <div class="copy-button">
      <button id="copy">Copy Link</button>
    </div>
    <div class="share-button">
      <button id="share">Share Link</button>
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
