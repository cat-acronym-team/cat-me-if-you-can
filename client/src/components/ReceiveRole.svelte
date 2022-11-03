<script lang="ts">
  import type { PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { getPrivatePlayerCollection } from "$lib/firebase/firestore-collections";
  import { doc, getDoc } from "firebase/firestore";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import { onMount } from "svelte";
  // import { assignRole } from "$lib/firebase/role";
  import { authStore as user } from "$stores/auth";

  export let lobbyCode: string;
  let getRole: PrivatePlayer;

  // Runs the assignRole function using the lobby to assign every user a role. Then pulls the current user's uid and their data.
  onMount(async () => {
    const lobby = doc(lobbyCollection, lobbyCode);
    if ($user !== null) {
      const getRoleDoc = await getDoc(doc(getPrivatePlayerCollection(lobby), $user.uid));
      getRole = getRoleDoc.data() as PrivatePlayer;
    }
  });
</script>

{#if getRole !== undefined}
  <div class="container">
    <div class="header">Time to find your purrfect match!</div>
    <div class="role">
      You are a <span>{getRole.role}</span>
      <p><i>Insert Image</i></p>
    </div>
  </div>
{/if}

<style>
  .container {
    position: relative;
    height: 100vh;
  }

  .header {
    position: absolute;
    width: 50%;
    height: 10%;
    font-size: 4em;
    font-weight: bold;
    left: 25%;
    top: 10%;
    text-align: center;
  }

  .role {
    position: absolute;
    width: 20%;
    height: 30%;
    left: 40%;
    top: 25%;
    font-size: 4em;
    text-align: center;
  }

  p {
    position: absolute;
    width: 80%;
    left: 10%;
    top: 40%;
    border: 2px solid black;
    height: 80%;
    color: blue;
  }

  span {
    color: red;
  }
</style>
