<script lang="ts">
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import LobbyChat from "./LobbyChat.svelte";
  import { addVote } from "$lib/firebase/vote";
  import { authStore as user } from "$stores/auth";
  import { avatarAltText } from "$lib/avatar";

  export let lobby: Lobby;
  export let lobbyCode: string;
</script>

<div class="lobby-chat-level">
  <LobbyChat {lobby} {lobbyCode} />
</div>
<div class="voting">
  <div class="voting-grid">
    {#each lobby.players as { avatar, displayName, votes }, i}
      <div class="vote-container">
        <button
          class="avatar"
          disabled={$user?.uid == lobby.uids[i]}
          on:click={() => addVote(lobbyCode, $user?.uid ?? "", lobby.uids[i])}
        >
          <img src="/avatars/{avatar}.webp" alt={avatarAltText[avatar]} />
          <span class="mdc-typography--subtitle1">{displayName ?? ""}</span>
        </button>
        <span class="mdc-typography--heading6">{votes ?? 0}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .voting {
    /* height: 100%; */
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    justify-items: center;
  }
  .voting-grid {
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-template-rows: repeat(3, auto);
    place-content: center;
    gap: 12px 24px;
    height: 100%;
  }
  .vote-container {
    display: grid;
    row-gap: 10px;
    text-align: center;
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
    border: 1px currentColor solid;
  }

  .avatar img {
    height: 18vmin;
    width: 18vmin;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
