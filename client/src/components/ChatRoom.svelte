<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { getDocs, onSnapshot, orderBy, query, QueryDocumentSnapshot } from "firebase/firestore";
  import {
    chatMessageValidator,
    type ChatMessage,
    type ChatRoom,
    type Lobby,
    type Player,
  } from "$lib/firebase/firestore-types/lobby";
  import { findChatRoom } from "$lib/firebase/chat";
  import { getChatRoomMessagesCollection } from "$lib/firebase/firestore-collections";
  import type { User } from "firebase/auth";
  import { addChatMessage, deleteChatRooms } from "$lib/firebase/firestore-functions";
  // props
  export let lobbyData: Lobby & { id: string };
  // variables
  let user = $authStore as User;
  let userInfo: Player;
  let partnerInfo: Player;
  let chatRoomInfo: QueryDocumentSnapshot<ChatRoom>;
  let chatMessages: ChatMessage[] = [];
  let timer: ReturnType<typeof setInterval>;
  let countdown: number = 60;
  let end = Date.now() + 60000;
  let message: string = "";
  let error = {
    status: false,
    message: "",
  };

  onMount(async () => {
    // Query for their chatroom
    chatRoomInfo = await findChatRoom(lobbyData.id, user.uid);
    // subscribe the chat messages
    onSnapshot(
      query(getChatRoomMessagesCollection(lobbyData.id, chatRoomInfo.id), orderBy("timestamp", "asc")),
      async (collection) => {
        chatMessages = collection.docs.map((message) => message.data());
      }
    );
    // Get userInfo
    userInfo = lobbyData.players[lobbyData.uids.indexOf(user.uid)];
    // Get partnerInfo
    const [partner] = chatRoomInfo.data().pair.filter((u) => {
      return user.uid !== u;
    });
    partnerInfo = lobbyData.players[lobbyData.uids.indexOf(partner)];
    // create timer
    timer = setInterval(() => {
      const diff = Math.floor((end - Date.now()) / 1000);
      countdown = diff;
    }, 500);
  });
  onDestroy(() => {
    clearInterval(timer);
  });
  // Function will create document with new message
  function submitMessage() {
    if (message === "") {
      return;
    }
    // validate message
    const validate = chatMessageValidator(message);
    if (!validate.valid) {
      error = {
        status: true,
        message: validate.reason,
      };
      message = "";
      return;
    }
    // add Message
    addChatMessage({ code: lobbyData.id, roomId: chatRoomInfo.id, message });
    message = "";
  }
  // Checks if the sender is the current user
  function isUser(uid: string) {
    return (user as User).uid === uid;
  }
  // Reactive Calls
  $: if (countdown === 0) {
    clearInterval(timer);
    // Deletes all the chatrooms and switches game state
    deleteChatRooms({ code: lobbyData.id });
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
    {#if error.status}
      <p class="error">{error.message}</p>
    {/if}
  </form>
</div>

<style>
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
  .countdown {
    font-size: 3em;
    font-weight: bold;
  }
  .messages {
    width: 100%;
    height: 65%;
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
  .error {
    color: salmon;
  }
</style>
