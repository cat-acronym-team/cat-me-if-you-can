<script lang="ts">
  //import type { PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  //import { getPrivatePlayerCollection } from "$lib/firebase/firestore-collections";
  import { doc, setDoc, getDoc } from "firebase/firestore";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  //import { page } from "$app/stores";
  //import { authStore as user } from "$stores/auth";
  //import { sortUserPlugins } from "vite";
  import type { Lobby, Player } from "$lib/firebase/firestore-types/lobby";
  //import { displayNameValidator } from "../../../../functions/src/firestore-types/users";
  import { onMount } from "svelte";

  export let code: string;
  let count = 0;
  let lobbyData: Lobby;
  let alive: Player[];

  onMount(async () => {
    const lobbyDoc = await getDoc(doc(lobbyCollection, code));
    lobbyData = lobbyDoc.data() as Lobby;
    for (let i = 0; i < lobbyData.players.length; i++) {
      if (lobbyData.players[count].alive === true) {
        alive.push(lobbyData.players[i]);
      }
    }
  });
</script>

<body>
  <p>Vote:</p>
  <div class="btn-group" style="width:100%">
    {#each alive as alives, i}
      {#if i === 4}
        <div class="btn-group" style="width:100%" />
      {/if}
      <button style="width:15%">{alives.displayName}</button>
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
