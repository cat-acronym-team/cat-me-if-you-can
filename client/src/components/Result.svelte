<script lang="ts">
  import { type Lobby, GAME_STATE_DURATIONS } from "$lib/firebase/firestore-types/lobby";
  import { authStore as user } from "$stores/auth";
  import { onMount } from "svelte";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";

  export let lobby: Lobby;
  export let lobbyCode: string;

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

<div class="result">
  {#if lobby.votedOff == undefined}
    <h1>Somehow undefined</h1>
  {:else if lobby.votedOff == "NONE"}
    <h1>No one was voted off</h1>
  {:else}
    <h1>{lobby.votedOff} was voted off</h1>
  {/if}
</div>

<style>
  .result {
    height: 100%;
    display: grid;
    justify-content: center;
    align-items: center;
  }
</style>
