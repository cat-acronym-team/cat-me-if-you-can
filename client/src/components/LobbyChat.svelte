<script lang="ts">
  import Modal from "./Modal.svelte";
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { onSnapshot, orderBy, query } from "firebase/firestore";
  import type { ChatMessage, Lobby, Player } from "$lib/firebase/firestore-types/lobby";
  import type { Unsubscribe, User } from "firebase/auth";
  import { getLobbyChatCollection } from "$lib/firebase/firestore-collections";
  import { addLobbyChatMessage } from "$lib/firebase/lobby-chat";

  export let lobbyData: Lobby & { id: string };

  let user = $authStore as User;
  let userInfo: Player;
  let openSignInModal = false;
  let message: string = "";
  let errorMessage: string = "";
  let chatMessages: ChatMessage[] = [];
  let unsubscribeChatMessages: Unsubscribe | undefined = undefined;

  onMount(async () => {
    unsubscribeChatMessages = onSnapshot(
      query(getLobbyChatCollection(lobbyData.id), orderBy("timestamp", "asc")),
      (collection) => {
        chatMessages = collection.docs.map((message) => message.data());
      }
    );
  });

  userInfo = lobbyData.players[lobbyData.uids.indexOf(user.uid)];

  onDestroy(() => {
    unsubscribeChatMessages?.();
  });
  async function submitMessage() {
    if (message === "") {
      return;
    }
    try {
      // add Message
      await addLobbyChatMessage(lobbyData.id, user.uid, message);
      // clear the input
      message = "";
      // if there's an error message then clear it
      errorMessage = "";
    } catch (err) {
      // catch and display erro
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
  function isUser(uid: string) {
    return (user as User).uid === uid;
  }
</script>

<main>
  <Modal open={openSignInModal}>
    <div class="chatroom">
      <button class="close" on:click={() => (openSignInModal = false)}>X</button>
      <div class="messages">
        {#each chatMessages as message}
          {#if isUser(message.sender)}
            <p class="user-msg">{message.text}</p>
          {:else}
            <p class="lobby-msg">{message.sender}: {message.text}</p>
          {/if}
        {/each}
      </div>
      <div class="chatRoom">
        <form on:submit|preventDefault={submitMessage}>
          <input type="text" bind:value={message} />
          <button type="submit" disabled={message === ""}>Send</button>
          {#if errorMessage !== ""}
            <p class="error">{errorMessage}</p>
          {/if}
        </form>
      </div>
    </div>
  </Modal>
  <button
    on:click={() => {
      openSignInModal = true;
    }}
    class="Lobby Chat">Lobby Chat</button
  >
</main>

<style>
  .messages {
    width: 100%;
    height: 60%;
    overflow-y: scroll;
  }
  .user-msg {
    text-align: right;
    background-color: skyblue;
    width: fit-content;
    margin-left: auto;
    padding: 5px;
    border-radius: 15px;
  }
  .lobby-msg {
    text-align: left;
    background-color: red;
    width: fit-content;
    padding: 5px;
    border-radius: 15px;
  }
  .chatroom {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 90%;
    height: 100%;
    margin: auto;
    text-align: center;
  }
</style>
