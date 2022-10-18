<script lang="ts">
  import type { ChatRoom, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { stalkChatroom } from "$lib/firebase/firestore-functions";
  import { getChatRoomCollection } from "$lib/firebase/firestore-collections";
  import { getDocs } from "firebase/firestore";
  import { onMount } from "svelte/types/runtime/internal/lifecycle";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let chatrooms: ChatRoom[] = [];

  onMount(async () => {
    const chatSnapshot = await getDocs(getChatRoomCollection(lobbyCode));
    chatrooms = chatSnapshot.docs.map((room) => room.data());
  });

  /**
   * takes uid of single user, then uses the index of uid to find and return display name
   */
  function findDisplayName(uid: string): string {
    return lobby.players[lobby.uids.indexOf(uid)].displayName;
  }

  // function onClickChat()
</script>

<div class="container">
  <h1>Stalk a chat:</h1>
  {#if chatrooms != undefined}
    {#each chatrooms as chatroom}
      <!-- add onClickChat function created in script which uses stalkChatroom function -->
      <button class="chatRoom">
        <span class="pair">{findDisplayName(chatroom.pair[0]) + " & " + findDisplayName(chatroom.pair[1])}</span>
      </button><br />
    {/each}
  {/if}
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
