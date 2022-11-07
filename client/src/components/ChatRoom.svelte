<script lang="ts">
  import ChatMessages from "$components/ChatMessages.svelte";
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
  import { formatTimer } from "$lib/time";
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
    }, 100);
  });
  onDestroy(() => {
    clearInterval(timer);
    unsubscribeChatMessages?.();
  });
  // Function will create document with new message
  async function submitMessage(message: string) {
    try {
      // add Message
      await addChatMessage(lobbyData.id, chatRoomInfo.id, user.uid, message);
      // if there's an error message then clear it
      errorMessage = "";
    } catch (err) {
      // catch and display erro
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  // Reactive Calls
  $: if (countdown <= 0 && lobbyData.uids[0] === user.uid) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyData.id });
  }
  $: if (countdown < -5) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyData.id });
  }
</script>

<div class="chatroom">
  <p class="countdown mdc-typography--headline2 {countdown < 10 ? 'error' : ''}">
    {formatTimer(Math.max(countdown, 0))}
  </p>
  <ChatMessages lobby={lobbyData} messages={chatMessages} on:send={(event) => submitMessage(event.detail.text)}>
    <div slot="before-messages" class="matched-with mdc-typography--headline5">
      {#if partnerInfo !== undefined}
        You matched with {partnerInfo.displayName}
      {/if}
    </div>
  </ChatMessages>
  {#if errorMessage !== ""}
    <p class="error">{errorMessage}</p>
  {/if}
</div>

<style>
  .chatroom {
    height: 100%;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 12px;
    justify-items: center;
  }

  .countdown {
    margin: 0;
  }

  .matched-with {
    justify-self: center;
  }
</style>
