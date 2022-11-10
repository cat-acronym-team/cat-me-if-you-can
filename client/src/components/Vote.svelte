<script lang="ts">
  import { type Lobby, GAME_STATE_DURATIONS } from "$lib/firebase/firestore-types/lobby";
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
  let selected: number;

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

<div class="voting">
  <p class="countdown mdc-typography--headline2 {countdown < 10 ? 'error' : ''}">
    {formatTimer(Math.max(countdown, 0))}
  </p>
  <p class="mdc-typography--headline4">Vote out the catfish</p>
  <div class="voting-grid">
    {#each lobby.players as { avatar, displayName, votes, alive, promptAnswer }, i}
      <div class="vote-container">
        <button
          class="avatar {!alive ? 'dead' : ''} {selected == i ? 'selected' : ''}"
          disabled={!alive}
          on:click={async () => {
            await addVote(lobbyCode, $user?.uid ?? "", lobby.uids[i]);
            selected = i;
          }}
        >
          <img class={!alive ? "dead" : ""} src="/avatars/{avatar}.webp" alt={avatarAltText[avatar]} />
          <span class="mdc-typography--subtitle1">{displayName ?? ""}</span>
          <div class="mdc-typography--caption">
            {#if alive}
              {promptAnswer ?? "no answer"}
            {:else}
              Im dead
            {/if}
          </div>
        </button>
        <span class="mdc-typography--heading6 {!alive ? 'dead' : ''}">{votes ?? 0}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .voting {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    justify-items: center;
  }
  .voting-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, auto);
    place-content: center;
    gap: 12px 12px;
    height: 100%;
  }
  .vote-container {
    display: grid;
    row-gap: 10px;
    text-align: center;
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

  @media (min-width: 800px) {
    .voting {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      justify-items: center;
    }
    .voting-grid {
      display: grid;
      grid-template-columns: repeat(3, auto);
      grid-template-rows: repeat(4, auto);
      place-content: center;
      gap: 12px 24px;
      height: 100%;
    }

  }
  @media (min-width: 1000px) {
    .voting {
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
  }

  .dead {
    opacity: 0.5;
  }
  .selected {
    border-color: green;
  }
</style>
