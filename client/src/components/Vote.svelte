<script lang="ts">
  // import type { PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  // import { getPrivatePlayerCollection } from "$lib/firebase/firestore-collections";
  // import { doc, setDoc, updateDoc } from "firebase/firestore";
  // import { lobbyCollection } from "$lib/firebase/firestore-collections";
  // import { page } from "$app/stores";
  // import { authStore as user } from "$stores/auth";
  // import { sortUserPlugins } from "vite";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  // import { onMount } from "svelte";
  import { vote } from "$lib/firebase/vote";
  import { authStore as user } from "$stores/auth";

  export let code: string;
  export let lobbyData: Lobby;
</script>

<body>
  <p>Vote:</p>
  <div class="btn-group" style="width:100%">
    {#each lobbyData.players as votees, i}
      {#if i === 4}
        <div class="btn-group" style="width:100%" />
      {/if}
      <button style="width:15%" on:click={() => vote(i, lobbyData, code, $user.uid)}>{votees.displayName}</button>
    {/each}
  </div>
</body>

<style>
  .btn-group button {
    background-color: #f1eaea;
    border: 1px solid black;
    color: black;
    padding: 40px 24px;
    cursor: pointer;
    float: left;
  }

  .btn-group:after {
    content: "";
    clear: both;
    display: table;
  }

  .btn-group button:not(:last-child) {
    border-right: none;
  }

  .btn-group button:hover {
    background-color: #cccccb;
  }
  button {
    margin: 20px;
  }
</style>
