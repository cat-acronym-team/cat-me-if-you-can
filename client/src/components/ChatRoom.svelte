<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { onSnapshot, orderBy, query, QueryDocumentSnapshot } from "firebase/firestore";
  import {
    GAME_STATE_DURATIONS,
    type ChatMessage,
    type ChatRoom,
    type Lobby,
    type Player,
  } from "$lib/firebase/firestore-types/lobby";
  import { findChatRoom, addChatMessage } from "$lib/firebase/chat";
  import { getChatRoomMessagesCollection } from "$lib/firebase/firestore-collections";
  import type { Unsubscribe, User } from "firebase/auth";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  // props
  export let lobbyData: Lobby & { id: string };
  // variables
  let user = $authStore as User;
  let userInfo: Player;
  let partnerInfo: Player | undefined;
  let chatRoomInfo: QueryDocumentSnapshot<ChatRoom>;
  let chatMessages: ChatMessage[] = [];
  let timer: ReturnType<typeof setInterval>;
  let countdown = GAME_STATE_DURATIONS.CHAT;
  let message: string = "";
  let errorMessage: string = "";
  let unsubscribeChatMessages: Unsubscribe | undefined = undefined;

  onMount(async () => {
    // Query for their chatroom
    chatRoomInfo = await findChatRoom(lobbyData.id, user.uid);
    // subscribe the chat messages
    unsubscribeChatMessages = onSnapshot(
      query(getChatRoomMessagesCollection(lobbyData.id, chatRoomInfo.id), orderBy("timestamp", "asc")),
      (collection) => {
        chatMessages = collection.docs.map((message) => message.data());
      }
    );

    // Get userInfo
    userInfo = lobbyData.players[lobbyData.uids.indexOf(user.uid)];
    // Get partnerInfo
    const partner = chatRoomInfo.data().pair.find((uid) => {
      return user.uid !== uid;
    });
    if (partner !== undefined) {
      partnerInfo = lobbyData.players[lobbyData.uids.indexOf(partner)];
    }
    // create timer
    timer = setInterval(() => {
      if (lobbyData.expiration != undefined) {
        const diff = Math.floor((lobbyData.expiration.toMillis() - Date.now()) / 1000);
        countdown = diff;
      }
    }, 500);
  });
  onDestroy(() => {
    clearInterval(timer);
    unsubscribeChatMessages?.();
  });
  // Function will create document with new message
  async function submitMessage() {
    if (message === "") {
      return;
    }
    try {
      // add Message
      await addChatMessage(lobbyData.id, chatRoomInfo.id, user.uid, message);
      // clear the input
      message = "";
      // if there's an error message then clear it
      errorMessage = "";
    } catch (err) {
      // catch and display erro
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
  // Checks if the sender is the current user
  function isUser(uid: string) {
    return user.uid === uid;
  }
  // Reactive Calls
  $: if (countdown === 0 && lobbyData.uids[0] === user.uid) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyData.id });
  }
  $: if (countdown < -5) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyData.id });
  }
</script>

<div class="chatroom">
  <p class="countdown">{countdown}</p>
  {#if partnerInfo !== undefined}
    <div>MATCHED WITH {partnerInfo.displayName.toUpperCase()}</div>
  {/if}
  <div class="messages">
    {#each chatMessages as message}
      {#if isUser(message.sender)}
        <p class="user-msg">{message.text}</p>
      {:else}
        <p class="partner-msg">{message.text}</p>
      {/if}
    {/each}
  </div>
  <form on:submit|preventDefault={submitMessage}>
    <input type="text" bind:value={message} />
    <button type="submit" disabled={message === ""}>Send</button>
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
    {/if}
  </form>
</div>

<style>
  .chatroom {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 90%;
    height: 100%;
    margin: auto;
    text-align: center;
  }
  .countdown {
    font-size: 3em;
    font-weight: bold;
  }
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
  .partner-msg {
    text-align: left;
    background-color: red;
    width: fit-content;
    padding: 5px;
    border-radius: 15px;
  }
  .chatroom form,
  input {
    width: 75%;
    margin: auto;
    height: 45px;
  }
  button {
    height: 50px;
  }
</style>
