<script lang="ts">
  import ChatRoom from "./ChatRoom.svelte";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { generatePairChatrooms, isInChatRoom } from "$lib/firebase/chat";
  import { authStore as user } from "$stores/auth";
  import type { User } from "firebase/auth";
  /*
  Expect players from lobby page
  Pair those players up randomly
  Enter those players into a chat room 
   - they are able to see their answers to the prompt
   - they are able to message back and forward
   - empty messages aren't allowed
   - able to see incoming messages (IDK!! IS THIS VERSION 1 OR 2)
   - show error message if message is invalid
  Display a timer for how long they can chat
  After chat phase is over delete the document
  */
  export let lobbyData: Lobby & { id: string };
  let inChatRoom: boolean = false;
  onMount(async () => {
    // Checks if the user is already in a chat room 
    // If not then generate pairs and chatrooms
    // If so then return because they could've generated multiple chatrooms on refresh
    let notInChat = await isInChatRoom(lobbyData.id, ($user as User).uid);
    if (!notInChat) {
      return;
    }
    generatePairChatrooms(lobbyData.id, lobbyData.uids);
  });
  setTimeout(() => {
    console.log("timeout called");
    inChatRoom = true;
  }, 2500);
  console.log(inChatRoom);
</script>

{#if inChatRoom}
  <ChatRoom lobbyId={lobbyData.id} />
{:else}
  <h1 style="text-align: center;">Time for chatting!</h1>
  <div class="players">
    {#each lobbyData.players as player}
      <div class="player">
        <div class="avatar-holder" />
        <p>{player.displayName}</p>
      </div>
    {/each}
  </div>
{/if}

<style>
  .players {
    display: flex;
    flex-wrap: wrap;
    width: 75%;
    margin: auto;
    text-align: center;
    justify-content: space-evenly;
  }
  .avatar-holder {
    width: 50px;
    height: 50px;
    background-color: rgb(249, 116, 116);
  }
</style>
