<script lang="ts">
  import SelectAvatar from "./SelectAvatar.svelte";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Mdi from "$components/Mdi.svelte";
  import { mdiContentCopy, mdiShareVariant } from "@mdi/js";
  import { page } from "$app/stores";
  import type { Avatar, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { changeAvatar, startGame, leaveLobby } from "$lib/firebase/firebase-functions";
  import { goto } from "$app/navigation";
  import { authStore as user } from "$stores/auth";

  // Props
  export let lobbyCode: string;
  export let lobby: Lobby;
  $: playersLength = Object.keys(lobby.players).length;
  let errorMessage: string = "";
  $: minPlayers = lobby.lobbySettings.catfishAmount * 2 + 2;

  /**
   * variable that will be set true if the corresponding function has no errors thrown
   * this will then allow the button to be pressed again if there is an error thrown
   */
  let waiting: boolean = false;

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

  async function onAvatarSelect(avatar: Avatar) {
    try {
      await changeAvatar({ lobbyCode, avatar });
      errorMessage = "";
    } catch (err) {
      console.error(err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function start() {
    waiting = true;
    try {
      await startGame({ code: lobbyCode });
    } catch (err) {
      waiting = false;
      console.error(err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function leave() {
    waiting = true;
    try {
      await leaveLobby({ code: lobbyCode });
    } catch (err) {
      waiting = false;
      console.error(err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<div class="container">
  <div class="lobby-info">
    <h3>Code: {lobbyCode}</h3>
    <h3>Players: {playersLength} / 8</h3>
    {#if playersLength < minPlayers}
      <!-- Display the number of players needed to start the current game session -->
      {#if minPlayers - playersLength !== 1}
        <!-- Grammar check -->
        <h3 class="error">{minPlayers - playersLength} more players required to start game...</h3>
      {:else}
        <h3 class="error">1 more player required to start game...</h3>
      {/if}
    {:else}
      <h3 class="error">Waiting for host to start game...</h3>
    {/if}
  </div>
  <SelectAvatar {lobby} {lobbyCode} on:change={(event) => onAvatarSelect(event.detail.value)} />
  {#if $user?.uid === lobby.host}
    <div class="actions">
      <Button on:click={() => start()} disabled={playersLength < minPlayers || waiting}
        ><Label>Start Game</Label></Button
      >
    </div>
  {/if}
  <div class="actions">
    <Button
      on:click={async () => {
        await leave();
        goto("/");
      }}
      disabled={waiting}
    >
      <Label>Leave Lobby</Label>
    </Button>
  </div>
  <div class="actions">
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
    {/if}
  </div>
  <div class="buttons">
    <h3 class="invite-link">Invite Link: {url}</h3>
    <IconButton on:click={copyLink}><Mdi path={mdiContentCopy} /></IconButton>
    {#if canShare}<IconButton on:click={share}><Mdi path={mdiShareVariant} /></IconButton>{/if}
  </div>
</div>

<style>
  .actions {
    display: grid;
    place-items: center;
  }

  .buttons {
    display: grid;
    grid-template-columns: 1fr auto auto;
  }

  .error {
    text-align: center;
    margin: auto 0;
    padding: 20px;
  }

  .invite-link {
    margin: 0;
  }
</style>
