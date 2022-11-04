<script lang="ts">
  import type { ChatRoom as ChatRoomType, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { stalkChatroom } from "$lib/firebase/firebase-functions";
  import { getChatRoomCollection } from "$lib/firebase/firestore-collections";
  import { getDocs, onSnapshot, query, where } from "firebase/firestore";
  import { onMount } from "svelte";
  import ChatRoom from "./ChatRoom.svelte";
  import { authStore as user } from "$stores/auth";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let chatrooms: ChatRoomType[] = [];
  let chatroomsIds: string[] = [];
  let selectedChat: string | undefined = undefined;

  onMount(async () => {
    const chatCollection = getChatRoomCollection(lobbyCode);
    const chatSnapshot = await getDocs(chatCollection);
    chatroomsIds = chatSnapshot.docs.map((room) => room.id);
    chatrooms = chatSnapshot.docs.map((room) => room.data());

    onSnapshot(query(chatCollection, where("viewers", "array-contains", $user!.uid)), (snapshot) => {
      if (snapshot.docs.length != 0) {
        selectedChat = snapshot.docs[0].id;
      }
    });
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

  // onsnapshot subscribe to list of all chatrooms where you a viewer, if not empty switch to show chatroom
</script>

{#if selectedChat == undefined}
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
{:else}
  <ChatRoom lobbyData={{ ...lobby, id: lobbyCode }} isStalker={true} />
{/if}

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
