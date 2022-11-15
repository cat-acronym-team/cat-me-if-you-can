<script lang="ts">
  import ChatMessages from "$components/ChatMessages.svelte";
  import Stalker from "$components/Stalker.svelte";
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$stores/auth";
  import { onSnapshot, orderBy, Query, query, where, type Unsubscribe } from "firebase/firestore";
  import {
    GAME_STATE_DURATIONS,
    type ChatMessage,
    type ChatRoom,
    type Lobby,
    type Player,
  } from "$lib/firebase/firestore-types/lobby";
  import { addChatMessage } from "$lib/firebase/chat";
  import { getChatRoomCollection, getChatRoomMessagesCollection } from "$lib/firebase/firestore-collections";
  import type { User } from "firebase/auth";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  import { formatTimer } from "$lib/time";
  // props
  export let lobby: Lobby;
  export let lobbyCode: string;
  export let isStalker: boolean;
  // variables
  let user = $authStore as User;
  let partnerInfo: Player | undefined;
  let pairInfo: [Player, Player] | undefined;
  let chatRoomId: string | undefined = undefined;
  let chatMessages: ChatMessage[] = [];
  let timer: ReturnType<typeof setInterval>;
  let countdown = GAME_STATE_DURATIONS.CHAT;
  let errorMessage: string = "";
  let unsubscribeChatRooms: Unsubscribe | undefined = undefined;
  let unsubscribeChatMessages: Unsubscribe | undefined = undefined;

  onMount(() => {
    const chatRoomCollection = getChatRoomCollection(lobbyCode);
    let roomQuerry: Query<ChatRoom>;
    if (isStalker) {
      roomQuerry = query(chatRoomCollection, where("viewers", "array-contains", user.uid));
    } else {
      roomQuerry = query(chatRoomCollection, where("pair", "array-contains", user.uid));
    }

    unsubscribeChatRooms = onSnapshot(roomQuerry, (roomsSnapshot) => {
      // skip if chatRoom not found yet
      if (roomsSnapshot.docs.length == 0) {
        return;
      }

      // store chatroom id
      chatRoomId = roomsSnapshot.docs[0].id;

      // process chatroom data
      const chatRoom = roomsSnapshot.docs[0].data();
      if (isStalker) {
        // get pairInfo
        pairInfo = chatRoom.pair.map((uid) => lobby.players[lobby.uids.indexOf(uid)]) as [Player, Player];
      } else {
        // Get partnerInfo
        const partner = chatRoom.pair.find((uid) => user.uid !== uid);
        if (partner !== undefined) {
          partnerInfo = lobby.players[lobby.uids.indexOf(partner)];
        }
      }

      // unsubscribe to old chatRoom if it exists
      unsubscribeChatMessages?.();

      // subscribe to new chatRoom
      unsubscribeChatMessages = onSnapshot(
        query(getChatRoomMessagesCollection(lobbyCode, chatRoomId), orderBy("timestamp", "asc")),
        (collection) => {
          chatMessages = collection.docs.map((message) => message.data());
        }
      );
    });

    // create timer
    timer = setInterval(() => {
      if (lobby.expiration != undefined) {
        const diff = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
        countdown = diff;
      }
    }, 100);
  });

  onDestroy(() => {
    clearInterval(timer);
    unsubscribeChatRooms?.();
    unsubscribeChatMessages?.();
  });

  // Function will create document with new message
  async function submitMessage(message: string) {
    try {
      if (chatRoomId == undefined) {
        throw new Error("ChatRoomId is undefined");
      }

      // add Message
      await addChatMessage(lobbyCode, chatRoomId, user.uid, message);

      // if there's an error message then clear it
      errorMessage = "";
    } catch (err) {
      // catch and display erro
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  // Reactive Calls
  $: if (countdown <= 0 && lobby.uids[0] === user.uid) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
  $: if (countdown < -5) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
</script>

<div class="chatroom">
  <p class="countdown mdc-typography--headline2 {countdown < 10 ? 'error' : ''}">
    {formatTimer(Math.max(countdown, 0))}
  </p>
  {#if isStalker && chatRoomId == undefined}
    <Stalker {lobby} {lobbyCode} />
  {:else}
    <ChatMessages
      {lobby}
      messages={chatMessages}
      on:send={(event) => submitMessage(event.detail.text)}
      readOnly={isStalker}
    >
      <div slot="before-messages" class="matched-with mdc-typography--headline5">
        {#if partnerInfo !== undefined}
          You matched with {partnerInfo.displayName}
        {:else if pairInfo !== undefined}
          {pairInfo[0].displayName} matched with {pairInfo[1].displayName}
        {/if}
      </div>
    </ChatMessages>
  {/if}
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
    text-align: center;
  }
</style>
