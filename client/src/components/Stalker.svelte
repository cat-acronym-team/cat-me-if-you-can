<script lang="ts">
  import type { ChatRoom, Lobby } from "$lib/firebase/firestore-types/lobby";

  export let lobby: Lobby;

  const chatrooms: ChatRoom[] = [
    {
      pair: ["player1", "player3"],
      viewers: ["monkey"],
    },
    {
      pair: ["player5", "player2"],
      viewers: ["gorilla"],
    },
    {
      pair: ["player4", "player6"],
      viewers: ["ape"],
    },
  ];

  /**
   * takes uid of single user, then uses the index of uid to find and return display name
   */
  function findDisplayName(uid: string): string {
    return lobby.players[lobby.uids.indexOf(uid)].displayName;
  }
</script>

<div class="container">
  <h1>Stalk a chat:</h1>
  {#each chatrooms as chatroom}
    <button class="chatRoom">
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
