<script lang="ts">
  import { type Lobby, GAME_STATE_DURATIONS } from "$lib/firebase/firestore-types/lobby";
  import LobbyChat from "./LobbyChat.svelte";
  import { addVote } from "$lib/firebase/vote";
  import { formatTimer } from "$lib/time";
  import { authStore as user } from "$stores/auth";
  import { onMount } from "svelte";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  import { avatarAltText } from "$lib/avatar";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let countdown = GAME_STATE_DURATIONS.VOTE;
  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    timer = setInterval(() => {
      if (lobby.expiration != undefined) {
        const diff = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
        countdown = diff;
      }
    }, 500);
  });

  $: if (countdown <= 0 && lobby.uids[0] == $user?.uid) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
  $: if (countdown <= -5) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
</script>

<div class="lobby-chat-level">
  <LobbyChat {lobby} {lobbyCode} />
</div>
<div class="voting">
  <p class="countdown mdc-typography--headline2 {countdown < 10 ? 'error' : ''}">
    {formatTimer(Math.max(countdown, 0))}
  </p>

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
