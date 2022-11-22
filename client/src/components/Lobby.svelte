<script lang="ts">
  import LobbyChat from "./LobbyChat.svelte";
  import SelectAvatar from "./SelectAvatar.svelte";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { page } from "$app/stores";
  import type { Avatar, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { changeAvatar, startGame, leaveLobby } from "$lib/firebase/firebase-functions";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/app";

  // Props
  export let lobbyCode: string;
  export let lobby: Lobby;
  let errorMessage: string = "";

  /**
  variable that will be set true if the corresponding function has no errors thrown
  this will then allow the button to be pressed again if there is an error thrown
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
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function start() {
    waiting = true;
    try {
      await startGame({ code: lobbyCode });
    } catch (err) {
      waiting = false;
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async function leave() {
    waiting = true;
    try {
      await leaveLobby({ code: lobbyCode });
    } catch (err) {
      waiting = false;
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<div class="container">
  <div class="lobby-info">
    <h3>Code: {lobbyCode}</h3>
    <h3>Players: {lobby.players.length}</h3>
  </div>
  <div class="lobby-chat-level">
    <LobbyChat {lobby} {lobbyCode} />
  </div>
  <SelectAvatar {lobby} on:change={(event) => onAvatarSelect(event.detail.value)} />
  {#if auth.currentUser?.uid === lobby.uids[0]}
    <div class="actions">
      <Button
        on:click={async () => {
            await start();
        }}
        disabled={waiting}><Label>Start Game</Label></Button
      >
    </div>
  {/if}
  <div class="actions">
    <Button
      on:click={async () => {
          await leave();
          goto("/");
      }}
      disabled={waiting}><Label>Leave Lobby</Label></Button
    >
  </div>
  <div class="actions">
    {#if errorMessage !== ""}
      <p>{errorMessage}</p>
    {/if}
  </div>
  <div class="buttons">
    <h3 class="invite-link">Invite Link: {url}</h3>
    <IconButton class="material-icons" on:click={copyLink}>content_copy</IconButton>
    {#if canShare}<IconButton class="material-icons" on:click={share}>share</IconButton>{/if}
  </div>
</div>

<style>
  .lobby-chat-level {
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

  .invite-link {
    margin: 0;
  }
</style>
