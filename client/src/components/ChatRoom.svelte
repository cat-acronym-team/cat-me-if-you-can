<script lang="ts">
  import { onMount } from "svelte";
  import { authStore as user } from "$stores/auth";
  import { onSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
  import type { ChatMessage, ChatRoom } from "$lib/firebase/firestore-types/lobby";
  import { findChatRoom, addMessage } from "$lib/firebase/chat";
  import { getChatRoomMessagesCollection } from "$lib/firebase/firestore-collections";
  import type { User } from "firebase/auth";

  export let lobbyId: string;

  let chatRoomInfo: QueryDocumentSnapshot<ChatRoom>;
  let chatMessages: ChatMessage[] = [];
  let message: string = "";
  onMount(async () => {
    // Query for their chatroom
    chatRoomInfo = await findChatRoom(lobbyId, ($user as User).uid);
    // subscribe the chat messages
    onSnapshot(getChatRoomMessagesCollection(lobbyId, chatRoomInfo.id), (collection) => {
      chatMessages = collection.docs.map((doc) => doc.data());
    });
  });

  // Function will create document with new message
  function submitMessage() {
    addMessage(lobbyId, chatRoomInfo.id, ($user as User).uid, message);
    message = "";
  }
</script>

<div>
  {#if chatMessages.length > 0}
    {#each chatMessages as message}
      <li>{message.sender}{message.text}</li>
    {/each}
  {/if}
  <form on:submit|preventDefault={submitMessage}>
    <input type="text" bind:value={message} />
    <button type="submit">Send</button>
  </form>
</div>
