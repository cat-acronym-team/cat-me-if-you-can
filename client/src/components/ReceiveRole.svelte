<script lang="ts">
  import { GAME_STATE_DURATIONS, type Lobby, type PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { authStore as user } from "$stores/auth";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";

  export let lobby: Lobby;
  export let lobbyCode: string;
  export let privatePlayer: PrivatePlayer;

  let countdown = GAME_STATE_DURATIONS.VOTE;
  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    timer = setInterval(() => {
      if (lobby.expiration != undefined) {
        const diff = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
        countdown = diff;
      }
    }, 500);
  });

  $: if (countdown <= 0 && lobby.uids[0] == $user?.uid) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
  $: if (countdown <= -5) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
</script>

{#if privatePlayer !== undefined}
  <div class="container">
    <div class="header">Time to find your purrfect match!</div>

    {#if privatePlayer.role == "CAT"}
      <div class="role">
        You are a <span class="green">{privatePlayer.role}</span>
      </div>
      <p class="description">Use your inner Purrlock Holmes and find the catfish!</p>
      <div class="imgContainer">
        <img src="/images/role/Cat.png" alt="cat" />
      </div>
    {:else if privatePlayer.role == "CATFISH"}
      <div class="role">
        You are a <span class="red">{privatePlayer.role}</span>
      </div>
      <p class="description">Try to cat-mo-flauge with the rest of the cats!</p>
      <div class="imgContainer">
        <img src="/images/role/Catfish.png" alt="catfish" />
      </div>
    {:else}
      <div class="role">
        You are a {privatePlayer.role}
      </div>
      <p class="description">Please wait till next game to get in on the fun</p>
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
    width: 85%;
    height: 10%;
    font-size: 4em;
    font-weight: bold;
    left: 7.5%;
    top: 0%;
    text-align: center;
  }

  .role {
    position: absolute;
    width: 70%;
    height: 30%;
    left: 15%;
    top: 15%;
    font-size: 4em;
    text-align: center;
  }

  .description {
    position: absolute;
    font-size: 3em;
    width: 75%;
    left: 12.5%;
    top: 70%;
    text-align: center;
  }

  .imgContainer {
    position: absolute;
    width: 30%;
    left: 35%;
    top: 30%;
    height: 35%;
  }

  img {
    height: 100%;
    width: 100%;
    padding-bottom: 20%;
  }

  .green {
    color: green;
  }

  .red {
    color: red;
  }
</style>
