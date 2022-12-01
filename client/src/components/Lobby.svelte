<script lang="ts">
  import LobbySettings from "./LobbySettings.svelte";
  import SelectAvatar from "./SelectAvatar.svelte";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { page } from "$app/stores";
  import type { Avatar, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { changeAvatar, startGame, leaveLobby } from "$lib/firebase/firebase-functions";
  import { goto } from "$app/navigation";
  import { authStore as user } from "../store/auth";

  // Props
  export let lobbyCode: string;
  export let lobby: Lobby;
  let errorMessage: string = "";
  $: minPlayers = lobby.lobbySettings.catfishAmount * 2 + 2;

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
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function start() {
    try {
      await startGame({ code: lobbyCode });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function leave() {
    try {
      await leaveLobby({ code: lobbyCode });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<div class="container">
  <div class="lobby-info">
    <h3>Code: {lobbyCode}</h3>
    <h3>Players: {lobby.players.length} / 8</h3>
    <div class="lobby-info-level">
      {#if $user?.uid === lobby.uids[0]}
        <LobbySettings {lobby} {lobbyCode} />
      {/if}
    </div>
    {#if lobby.players.length < minPlayers}
      <!-- Display the number of players needed to start the current game session -->
      {#if minPlayers - lobby.players.length !== 1}
        <!-- Grammar check -->
        <h3 class="error">{minPlayers - lobby.players.length} more players required to start game...</h3>
      {:else}
        <h3 class="error">1 more player required to start game...</h3>
      {/if}
    {:else}
      <h3 class="error">Waiting for host to start game...</h3>
    {/if}
  </div>

  <SelectAvatar {lobby} on:change={(event) => onAvatarSelect(event.detail.value)} />
  {#if $user?.uid === lobby.uids[0]}
    <div class="actions">
      <Button on:click|once={() => start()} disabled={lobby.players.length < minPlayers}
        ><Label>Start Game</Label></Button
      >
    </div>
  {/if}
  <div class="actions">
    <Button
      on:click|once={async () => {
        await leave();
        goto("/");
      }}><Label>Leave Lobby</Label></Button
    >
  </div>
  <div class="actions">
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

<style>
  .lobby-info-level {
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
  }

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
