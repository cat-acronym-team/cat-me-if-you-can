<script lang="ts">
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  import { GAME_STATE_DURATIONS, type Lobby } from "$lib/firebase/firestore-types/lobby";
  import { onDestroy, onMount } from "svelte";
  import { authStore as user } from "$stores/auth";

  export let lobby: Lobby;
  export let lobbyCode: string;
  let countdown = GAME_STATE_DURATIONS.END;
  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    timer = setInterval(() => {
      if (lobby.expiration != undefined) {
        const diff = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
        countdown = diff;
      }
    }, 1000);
  });
  onDestroy(() => {
    clearInterval(timer);
  });

  // apply stats
  $: if (countdown == 0 && $user?.uid == lobby.uids[0]) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
  $: if (countdown <= -5) {
    verifyExpiration({ code: lobbyCode });
    clearInterval(timer);
  }
</script>

<main>
  <h1>Win Loss dummy Page</h1>
</main>
