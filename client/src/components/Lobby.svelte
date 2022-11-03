<script lang="ts">
  import SelectAvatar from "./SelectAvatar.svelte";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { page } from "$app/stores";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { findAndLeaveLobby } from "$lib/firebase/leave-lobby";
  import { findAndStartLobby } from "$lib/firebase/start-lobby";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/app";

  // Props
  export let lobbyCode: string;
  export let lobby: Lobby;
  let errorMessage: string = "";

  // better link to share since it's redirecting to this page anyways
  // Josh's suggestion that I agreed on
  let url = `${$page.url.origin}/join?code=${lobbyCode}`;
  let canShare = false;
  // Allows for shareable data with text description
  const shareableData = {
    title: "Cat Me if you Can!",
    text: "Join us in a game of Cat Me if you Can!",
    url,
  };

  // Shares link with other players through click event
  async function share() {
    await navigator.share(shareableData);
  }

  onMount(() => {
    canShare = navigator.canShare?.(shareableData);
  });

  // Copies URL to clipboard on click
  function copyLink() {
    navigator.clipboard.writeText(url);
  }

  async function startGame() {
    try {
      await findAndStartLobby(lobbyCode);
    } catch (err) {
      console.log("HELLLO" + err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function leaveLobby() {
    try {
      await findAndLeaveLobby(lobbyCode);
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
  <div class="container">
    <div class="lobby-info">
      <h3>Code: {lobbyCode}</h3>
      <h3>Players: {lobby.players.length}</h3>
    </div>
    <SelectAvatar {lobby} {lobbyCode} />
    {#if auth.currentUser?.uid === lobby.uids[1]}<div class="start">
        <Button on:click={() => startGame()}><Label>Start Game</Label></Button>
      </div>{/if}
    <div class="leave">
      <Button
        on:click={() => {
          leaveLobby();
          goto("/");
        }}><Label>Leave Lobby</Label></Button
      >
    </div>
    <div class="error">
      {#if errorMessage !== ""}
        <p class="error">{errorMessage}</p>
      {/if}
    </div>
    <div class="buttons">
      <h3 class="invite-link">Invite Link: {url}</h3>
      <IconButton class="material-icons" on:click={copyLink}>content_copy</IconButton>
      {#if canShare}<IconButton class="material-icons" on:click={share}>share</IconButton>{/if}
    </div>
  </div>
</main>

<style>
  main {
    justify-content: center;
  }

  .start,
  .leave,
  .error {
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
