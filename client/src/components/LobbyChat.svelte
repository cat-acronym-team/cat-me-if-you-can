<script lang="ts">
  import Modal from "./Modal.svelte";
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { onSnapshot, orderBy, query, QueryDocumentSnapshot } from "firebase/firestore";
  import { type ChatMessage, type ChatRoom, type Lobby, type Player } from "$lib/firebase/firestore-types/lobby";
  import type { User } from "firebase/auth";
  import { getLobbyChatCollection } from "$lib/firebase/firestore-collections";

  export let lobbyData: Lobby & { id: string };

  let user = $authStore as User;
  let userInfo: Player;
  let openSignInModal = false;
  let message: string = "";
  let errorMessage: string = "";

  onMount(async () => {
    onSnapshot(
      query(getLobbyChatCollection(lobbyData.id), orderBy("timestamp", "asc")),
      async((collection) => {
        lobbyChatMessages = collection.docs.map((messages) => message.data());
      })
    );
  });

  async function submitMessage() {
    if (message === "") {
      return;
    }
    try {
      // add Message
      //await addChatMessage(lobbyData.id, chatRoomInfo.id, user.uid, message);
      //clear the input
      message = "";
      if (errorMessage !== "") {
        errorMessage = "";
      }
    } catch (err) {
      //errorMessage = err instanceOf Error ? err.message : String(err);
    }
  }
  function isUser(uid: string) {
    return (user as User).uid === uid;
  }
</script>

<main>
  <Modal open={openSignInModal}>
    <button class="close" on:click={() => (openSignInModal = false)}>X</button>
    {#each chatMessage as message}
      {#if isUser(message.sender)}
        <p class="user-msg">{message.text}</p>
      {:else}
        <p class="lobby-msg">{message.txt}</p>
      {/if}
    {/each}
    <div class="chatRoom">
      <form on:submit|preventDefault={submitMessage}>
        <input type="text" bind:value={message} />
        <button type="submit" disabled={message === ""}>Send</button>
      </form>
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
  .formGroup {
    position: absolute;
    bottom: 0px;
  }
  .user-msg {
    text-align: right;
    background-color: skyblue;
    width: fit-content;
    margin-left: auto;
    padding: 5px;
    border-radius: 15px;
  }
  .partner-msg {
    text-align: left;
    background-color: red;
    width: fit-content;
    padding: 5px;
    border-radius: 15px;
  }
  /* .chatRoom {
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
  } */
</style>
