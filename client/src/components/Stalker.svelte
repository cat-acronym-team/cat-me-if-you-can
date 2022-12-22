<script lang="ts">
  import type { Player, Lobby } from "$lib/firebase/firestore-types/lobby";
  import Ripple from "@smui/ripple";
  import { stalkChatroom } from "$lib/firebase/firebase-functions";
  import { getChatRoomCollection } from "$lib/firebase/firestore-collections";
  import { getDocs } from "firebase/firestore";
  import { onMount } from "svelte";
  import { avatarAltText, avatarColors, avatars } from "$lib/avatar";
  import { generateHclGradient } from "$lib/color";

  export let lobby: Lobby;
  export let lobbyCode: string;
  export let isSpectator: boolean;

  let chatrooms: { players: [Player, Player]; id: string }[] = [];

  let errorMessage: string | undefined = undefined;

  onMount(async () => {
    const chatCollection = getChatRoomCollection(lobbyCode);
    const chatSnapshot = await getDocs(chatCollection);
    chatrooms = chatSnapshot.docs.map((room) => ({
      id: room.id,
      players: room.data().pair.map((uid) => lobby.players[lobby.uids.indexOf(uid)]) as [Player, Player],
    }));
  });

  // takes chatid to send a stalk chatroom request
  async function onClickChat(chatId: string) {
    try {
      await stalkChatroom({ code: lobbyCode, chatId });
    } catch (err) {
      console.error(err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<div class="container">
  {#if isSpectator}
    <h1 class="mdc-typography--headline4">Select a chat to spectate</h1>
  {:else}
    <h1 class="mdc-typography--headline4">Select a chat to stalk</h1>
  {/if}
  {#if errorMessage != undefined}
    <p class="error">{errorMessage}</p>
  {/if}
  {#each chatrooms as chatroom}
    <button
      on:click={() => onClickChat(chatroom.id)}
      use:Ripple={{ surface: true }}
      style="background: {generateHclGradient(
        avatarColors[chatroom.players[0].avatar],
        avatarColors[chatroom.players[1].avatar]
      )};"
    >
      <div class="button-content base-theme-colors">
        <img src={avatars[chatroom.players[0].avatar]} alt={avatarAltText[chatroom.players[0].avatar]} />
        <span class="first-name mdc-typography--headline6">{chatroom.players[0].displayName}</span>

        <span class="second-name mdc-typography--headline6">{chatroom.players[1].displayName}</span>
        <img src={avatars[chatroom.players[1].avatar]} alt={avatarAltText[chatroom.players[1].avatar]} />
      </div>
    </button>
  {/each}
</div>

<style>
  .container {
    text-align: center;
    box-sizing: border-box;
    width: 100%;
    max-width: 800px;
    overflow-y: auto;
    padding: 24px;
  }

  .container > * {
    margin: 0;
  }

  .container > button {
    margin-top: 24px;
    display: block;
    width: 100%;
    position: relative;
    appearance: none;
    border: none;
    background: none;
    border: none;
    border-radius: 32px;
    padding: 8px;
  }

  .button-content {
    display: grid;
    grid-template-columns: 64px auto auto 64px;
    grid-template-rows: 64px;
    padding: 12px;
    gap: 12px;
    align-items: center;
    border-radius: 24px;
  }

  .button-content > img {
    width: 64px;
    height: 64px;
    object-fit: cover;
  }

  .button-content > img:first-of-type {
    transform: scaleX(-1);
  }

  @media (max-width: 550px) {
    .button-content {
      grid-template-columns: auto auto;
      padding-inline: 24px;
    }

    .button-content > img {
      display: none;
    }
  }

  .first-name {
    justify-self: start;
  }
  .second-name {
    justify-self: end;
  }
</style>
