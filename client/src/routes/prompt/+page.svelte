<script lang="ts">
  import Prompt from "$components/prompt.svelte";
  import type { Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby";

  const lobby: Lobby = {
    uids: ["nate"],
    players: [{ alive: true, displayName: "Nate", avatar: 1 }],
    state: "PROMPT",
  };
  const privatePlayer: PrivatePlayer = {
    role: "CAT",
    prompt: "What is a food that you have never tried but would like to?",
  };
</script>

<div class="wraper">
  <Prompt prompt={privatePlayer.prompt} />
</div>

<style>
  .wraper {
    height: 100vh;
  }
</style>
