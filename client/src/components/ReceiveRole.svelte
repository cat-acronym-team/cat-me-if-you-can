<script lang="ts">
  import type { PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { getPrivatePlayerCollection } from "$lib/firebase/firestore-collections";
  import { doc, getDoc } from "firebase/firestore";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import { onMount } from "svelte";
  import { assignRole } from "$lib/firebase/role";
  import { authStore as user } from "$stores/auth";

  export let lobbyCode: string;
  let getRole: PrivatePlayer;
  alert("Hello!");
  // Runs the assignRole function using the lobby to assign every user a role. Then pulls the current user's uid and their data.
  onMount(async () => {
    const lobby = doc(lobbyCollection, lobbyCode);
    await assignRole(lobby);
    if ($user !== null) {
      const getRoleDoc = await getDoc(doc(getPrivatePlayerCollection(lobby), $user.uid));
      getRole = getRoleDoc.data() as PrivatePlayer;
    }
  });
</script>

{#if getRole !== undefined}
  <div class="container">
    <div class="header">Time to find your purrfect match!</div>
    
      {#if getRole.role == "CAT"}
      <div class="role">
        You are a <span class="green">{getRole.role}</span>
      </div>
      <p class="description">Use your inner Purrlock Holmes and find the catfish!</p>
      <!-- TODO: Use different cat picture -->
      <img src="https://media.istockphoto.com/photos/front-view-of-british-shorthair-cat-7-months-old-sitting-picture-id104355461?k=20&m=104355461&s=612x612&w=0&h=9KPbuZ6tTUxqi-_WZT8zrjNrf1W8XBuXIw8ZIM_YQuI=" alt="cat">
      {:else}
      <div class="role">
        You are a <span class="red">{getRole.role}</span>
      </div>
      <p class="description">Try to cat-mo-flauge with the rest of the cats!</p>
      <!-- TODO: Use different catfish picture -->
        <img src="https://media.istockphoto.com/photos/channel-catfish-picture-id503331450?k=20&m=503331450&s=612x612&w=0&h=_ciR7YrmZN1EIooeMl1mo0aVJ3bGTXGVoFzBWVlTyts=" alt="catfish">
      {/if}
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
    top: 5%;
    text-align: center;
  }

  .role {
    position: absolute;
    width: 50%;
    height: 30%;
    left: 25%;
    top: 25%;
    font-size: 4em;
    text-align: center;
  }

  .description {
    position: absolute;
    font-size: 2.6em;
    width: 75%;
    left: 15%;
    top: 70%;
    text-align: center;
  }

  img {
    position: absolute;
    width: 30%;
    left: 35%;
    top: 35%;
    border: 2px solid black;
    height: 35%;
  }

  .green {
    color: green;
  }

  .red {
    color: red;
  }
</style>
