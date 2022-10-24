<script lang="ts">
  import Modal from "./Modal.svelte";
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { onSnapshot, orderBy, query, QueryDocumentSnapshot } from "firebase/firestore";
  import type { User } from "firebase/auth";

  //export let lobbyData: Lobby & { id: string };
  let openSignInModal = false;
  let message: string = "";
  let errorMessage: string = "";

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
</script>

<main>
  <Modal open={openSignInModal}>
    <button class="close" on:click={() => (openSignInModal = false)}>X</button>
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
  .chatRoom {
    position: absolute;
    bottom: 0;
    margin-left: 30%;
    /* top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 90%;
    height: 100%;
    margin: auto;
    text-align: center; */
  }
</style>
