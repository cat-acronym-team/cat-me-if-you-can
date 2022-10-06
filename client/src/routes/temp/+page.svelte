<script lang="ts">
  import { createLobby } from "$lib/firebase/create-lobby";
  import { goto } from "$app/navigation";

  async function tempCreate() {
    const code = (await createLobby()) as string;

    goto("/game/" + code);
  }
</script>

<main>
  <button id="start-game" on:click={tempCreate}>Start Game</button>
</main>
