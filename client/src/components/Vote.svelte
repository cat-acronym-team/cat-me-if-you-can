<script lang="ts">
  import AvatarImg from "./AvatarImg.svelte";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { addVote } from "$lib/firebase/vote";
  import { authStore as user } from "$stores/auth";
  import { onDestroy, onMount } from "svelte";
  import { doc, onSnapshot } from "firebase/firestore";
  import { getVoteCollection } from "$lib/firebase/firestore-collections";
  import type { Unsubscribe } from "firebase/auth";

  export let lobby: Lobby;
  export let lobbyCode: string;
  export let catfishes: string[]; // empty for cats or spectators | at least one for catfishes

  let errorMessage: string = "";

  let votedFor: string | null | undefined; // uid of player that is voted out or skip (null)
  let unsubscribeVote: Unsubscribe | undefined;

  onMount(() => {
    // get the document of the current user vote
    const voteDoc = doc(getVoteCollection(lobbyCode), $user?.uid);
    unsubscribeVote = onSnapshot(
      voteDoc,
      (doc) => {
        if (!doc.exists() || !lobby.alivePlayers.includes($user?.uid ?? "")) {
          return;
        }
        votedFor = doc.data().target;
      },
      (err) => {
        console.error(err);
        errorMessage = err instanceof Error ? err.message : String(err);
      }
    );
  });

  onDestroy(() => {
    unsubscribeVote?.();
  });

  async function vote(target: string | null) {
    try {
      await addVote(lobbyCode, $user?.uid ?? "", target);
      errorMessage = "";
    } catch (error) {
      console.error(error);
      errorMessage = error instanceof Error ? error.message : String(error);
    }
  }
</script>

<div class="voting">
  <p class="mdc-typography--headline4">Vote out the catfish</p>
  <div class="voting-grid">
    {#each lobby.players as { avatar, displayName, votes, alive, promptAnswer }, i}
      <div class="vote-container {!alive ? 'dead' : ''}">
        <button
          class="avatar {votedFor == lobby.uids[i] ? 'selected' : ''}"
          disabled={!lobby.alivePlayers.includes($user?.uid ?? "") || !alive}
          on:click={() => vote(lobby.uids[i])}
        >
          <AvatarImg {avatar} />
          <span class="mdc-typography--subtitle1" class:catfish={catfishes.includes(lobby.uids[i])}>
            {displayName ?? ""}
          </span>
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
      <button class="avatar {votedFor === null ? 'selected' : ''}" on:click={() => vote(null)}>
        <AvatarImg avatar={0} />
        <span class="mdc-typography--subtitle1">Skip</span>
        <div class="mdc-typography--caption">Vote for no cat</div>
      </button>
      <span class="mdc-typography--heading6">{lobby.skipVote}</span>
    </div>
  </div>
  {#if errorMessage !== ""}
    <p class="error">{errorMessage}</p>
  {/if}
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

  .avatar :global(img) {
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
