<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Modal from "./Modal.svelte";
  import IconButton from "@smui/icon-button";
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { onSnapshot, orderBy, query, where } from "firebase/firestore";
  import type { LobbyChatMessage, Lobby, Player } from "$lib/firebase/firestore-types/lobby";
  import type { Unsubscribe, User } from "firebase/auth";
  import { getLobbyChatCollection } from "$lib/firebase/firestore-collections";
  import { addLobbyChatMessages } from "$lib/firebase/chat";
  import ChatMessages from "./ChatMessages.svelte";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let user = $authStore as User;
  let userInfo: Player;
  let openSignInModal = false;
  let errorMessage: string = "";
  let chatMessages: LobbyChatMessage[] = [];
  let unsubscribeChatMessages: Unsubscribe | undefined = undefined;

  onMount(async () => {
    let messageQuery;
    if (userInfo.alive) {
      messageQuery = query(getLobbyChatCollection(lobbyCode), where("alive", "==", true), orderBy("timestamp", "asc"));
    } else {
      messageQuery = query(getLobbyChatCollection(lobbyCode), orderBy("timestamp", "asc"));
    }
    unsubscribeChatMessages = onSnapshot(messageQuery, (collection) => {
      chatMessages = collection.docs.map((message) => message.data());
      console.log(collection.docs);
    });
  });

  userInfo = lobby.players[lobby.uids.indexOf(user.uid)];

  onDestroy(() => {
    unsubscribeChatMessages?.();
  });
  async function submitMessage(message: string) {
    if (message === "") {
      return;
    }
    try {
      // add Message
      await addLobbyChatMessages(lobbyCode, user.uid, message, userInfo.alive);
      // clear the input
      message = "";
      // if there's an error message then clear it
      errorMessage = "";
    } catch (err) {
      // catch and display error
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
  <Modal open={openSignInModal}>
    <IconButton on:click={() => (openSignInModal = false)} class="material-icons">close</IconButton>
    <ChatMessages {lobby} messages={chatMessages} on:send={(event) => submitMessage(event.detail.text)}>
      <h2>Lobby Chat</h2>
      {#if errorMessage !== ""}
        <p class="error">{errorMessage}</p>
      {/if}
    </ChatMessages>
  </Modal>
  <button
    on:click={() => {
      openSignInModal = true;
    }}
    class="Lobby Chat">Lobby Chat</button
  >
</main>
