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

  let votedFor: number | undefined; // index of the person that's been voted
  let unsubscribeVote: Unsubscribe | undefined;

  onMount(() => {
    // get the document of the current user vote
    const voteDoc = doc(getVoteCollection(lobbyCode), $user?.uid);
    unsubscribeVote = onSnapshot(voteDoc, (doc) => {
      if (!doc.exists() || !lobby.alivePlayers.includes($user?.uid ?? "")) {
        return;
      }
      votedFor = lobby.uids.indexOf(doc.data().target);
    });
  });

  onDestroy(() => {
    unsubscribeVote?.();
  });
</script>

<div class="voting">
  <p class="mdc-typography--headline4">Vote out the catfish</p>
  <div class="voting-grid">
    {#each lobby.players as { avatar, displayName, votes, alive, promptAnswer }, i}
      <div class="vote-container {!alive ? 'dead' : ''}">
        <button
          class="avatar {votedFor == i ? 'selected' : ''}"
          disabled={!lobby.alivePlayers.includes($user?.uid ?? "") || !alive}
          on:click={() => addVote(lobbyCode, $user?.uid ?? "", lobby.uids[i])}
        >
          <img src="/avatars/{avatar}.webp" alt={avatarAltText[avatar]} />
          <span class="mdc-typography--subtitle1">{displayName ?? ""}</span>
          <div class="mdc-typography--caption">
            {#if alive}
              Answer: {promptAnswer ?? "no answer"}
            {:else}
              I'm dead
            {/if}
          </div>
        </button>
        <span class="mdc-typography--heading6">{votes}</span>
      </div>
    {/each}
    <div class="vote-container">
      <button
        class="avatar {votedFor == -1 ? 'selected' : ''}"
        on:click={() => addVote(lobbyCode, $user?.uid ?? "", "SKIP")}
      >
        <img src="/avatars/0.webp" alt={avatarAltText[0]} />
        <span class="mdc-typography--subtitle1">{"Skip Vote"}</span>
      </button>
      <span class="mdc-typography--heading6">{lobby.skipVote}</span>
    </div>
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
