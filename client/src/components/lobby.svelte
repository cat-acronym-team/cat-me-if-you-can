<script lang="ts">
  import SelectAvatar from "./SelectAvatar.svelte";
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

<main>
  <div class="container">
    <div class="lobby-info">
      <h3>Code: {code}</h3>
      <h3>Players:</h3>
    </div>
    <SelectAvatar {lobby} />
    <div class="start">
      <button id="start-game" on:click={startgame}>Start Game</button>
    </div>
    <div class="buttons">
      <h3 class="invite-link">Invite Link: {url}</h3>
      <button id="copy">Copy Link</button>
      <button id="share">Share Link</button>
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
</style>
