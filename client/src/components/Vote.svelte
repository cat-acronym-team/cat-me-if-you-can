<script lang="ts">
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { addVote } from "$lib/firebase/vote";
  import { authStore as user } from "$stores/auth";
  import { onDestroy, onMount } from "svelte";
  import { avatarAltText } from "$lib/avatar";
  import { doc, onSnapshot } from "firebase/firestore";
  import { getVoteCollection } from "$lib/firebase/firestore-collections";
  import type { Unsubscribe } from "firebase/auth";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let votedFor: string | undefined; // uid of the person that's been voted
  let unsubscribeVote: Unsubscribe | undefined;

  onMount(() => {
    // get the document of the current user vote
    const voteDoc = doc(getVoteCollection(lobbyCode), $user?.uid);
    unsubscribeVote = onSnapshot(voteDoc, (doc) => {
      if (!doc.exists() || !lobby.alivePlayers.includes($user?.uid ?? "")) {
        return;
      }
      votedFor = doc.data().target;
    });
  });

  onDestroy(() => {
    unsubscribeVote?.();
  });
</script>

<div class="voting">
  <p class="mdc-typography--headline4">Vote out the catfish</p>
  <div class="voting-grid">
    {#each Object.entries(lobby.players) as [uid, player]}
      <div class="vote-container {!player.alive ? 'dead' : ''}">
        <button
          class="avatar {votedFor == uid ? 'selected' : ''}"
          disabled={!lobby.alivePlayers.includes($user?.uid ?? "") || !player.alive}
          on:click={() => addVote(lobbyCode, $user?.uid ?? "", uid)}
        >
          <img src="/avatars/{player.avatar}.webp" alt={avatarAltText[player.avatar]} />
          <span class="mdc-typography--subtitle1">{player.displayName ?? ""}</span>
          <div class="mdc-typography--caption">
            {#if player.alive}
              Answer: {player.promptAnswer ?? "no answer"}
            {:else}
              Im dead
            {/if}
          </div>
        </button>
        <span class="mdc-typography--heading6">{player.votes ?? 0}</span>
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
    .voting-grid {
      grid-template-columns: repeat(3, auto);
      grid-template-rows: repeat(4, auto);
    }
  }
  @media (min-width: 1000px) {
    .voting-grid {
      grid-template-columns: repeat(4, auto);
      grid-template-rows: repeat(3, auto);
    }
  }

  .dead {
    opacity: 0.5;
  }
  .selected {
    border-color: var(--primary-theme-color);
  }
</style>
