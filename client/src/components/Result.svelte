<script lang="ts">
  import LobbyChat from "./LobbyChat.svelte";
  import type { Lobby, Player } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { avatarAltText } from "$lib/avatar";

  export let lobby: Lobby;

  export let lobbyCode: string;

  let votedOffUser: Player | undefined;

  onMount(() => {
    if (lobby.votedOff != undefined && lobby.votedOff != "NONE") {
      votedOffUser = lobby.players[lobby.uids.indexOf(lobby.votedOff)];
    }
  });
</script>

<div class="lobby-chat-level">
  <LobbyChat {lobby} {lobbyCode} />
</div>
<div class="result">
  {#if lobby.votedOff == undefined}
    <h1>Somehow undefined</h1>
  {:else if lobby.votedOff == "NONE"}
    <h1>No one was voted off</h1>
  {:else}
    <div class="avatar">
      <img src="/avatars/{votedOffUser?.avatar}.webp" alt={avatarAltText[votedOffUser?.avatar ?? 0]} />
      <h1>{votedOffUser?.displayName} was voted off</h1>
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

  .lobby-chat-level {
    width: 100%;
    display: flex;
    justify-content: left;
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
