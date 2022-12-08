<script lang="ts">
  import type { Lobby, Player } from "$lib/firebase/firestore-types/lobby";
  import { avatarAltText } from "$lib/avatar";

  export let lobby: Lobby;

  let votedOffUser: Player | undefined;

  $: if (lobby.votedOff != undefined && lobby.votedOff != "NONE") {
    votedOffUser = lobby.players[lobby.votedOff];
  } else {
    votedOffUser = undefined;
  }
</script>

<div class="result">
  {#if votedOffUser == undefined}
    <h1>No one was voted off</h1>
  {:else}
    <div class="avatar">
      <img src="/avatars/{votedOffUser.avatar}.webp" alt={avatarAltText[votedOffUser.avatar]} />
      <h1>{votedOffUser.displayName} was voted off</h1>
    </div>
  {/if}
</div>

<style>
  .result {
    height: 100%;
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .avatar {
    appearance: none;
    border: none;
    padding: 10px;
    background: none;

    display: grid;
    grid-template-rows: auto 16px;
    place-items: center;
    color: unset;
  }

  .avatar img {
    height: 18vmin;
    width: 18vmin;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
