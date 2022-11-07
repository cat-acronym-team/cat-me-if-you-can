<script lang="ts">
  import type { ChatRoom as ChatRoomType, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { stalkChatroom } from "$lib/firebase/firebase-functions";
  import { getChatRoomCollection } from "$lib/firebase/firestore-collections";
  import { getDocs } from "firebase/firestore";
  import { onMount } from "svelte";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let chatrooms: ChatRoomType[] = [];
  let chatroomsIds: string[] = [];

  onMount(async () => {
    const chatCollection = getChatRoomCollection(lobbyCode);
    const chatSnapshot = await getDocs(chatCollection);
    chatroomsIds = chatSnapshot.docs.map((room) => room.id);
    chatrooms = chatSnapshot.docs.map((room) => room.data());
  });

  /**
   * takes uid of single user, then uses the index of uid to find and return display name
   */
  function findDisplayName(uid: string): string {
    return lobby.players[lobby.uids.indexOf(uid)].displayName;
  }

  // takes chatid to send a stalk chatroom request
  function onClickChat(chatId: string) {
    const stalkChatroomRequest = { code: lobbyCode, chatId };
    return stalkChatroom(stalkChatroomRequest);
  }
</script>

<div class="container">
  <h1>Stalk a chat:</h1>
  {#each chatrooms as chatroom, i}
    <button
      on:click={async () => {
        await onClickChat(chatroomsIds[i]);
      }}
      class="chatRoom"
    >
      <span class="pair">{findDisplayName(chatroom.pair[0]) + " & " + findDisplayName(chatroom.pair[1])}</span>
    </button><br />
  {/each}
</div>

<style>
  .container {
    text-align: center;
    display: grid;
  }

  button {
    border: none;
    cursor: pointer;
    padding-left: 24px;
    padding-right: 24px;
    width: 150px;
    height: 50px;
    margin: auto;
    border-radius: 8px;
  }

  button:hover,
  button:focus-visible {
    color: rgb(187, 193, 199);
    background-color: rgb(68, 68, 68);
  }

  button:active {
    color: aliceblue;
    background-color: black;
  }
</style>
