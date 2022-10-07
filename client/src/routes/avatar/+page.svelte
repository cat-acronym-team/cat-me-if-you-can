<script lang="ts">
  import SelectAvatar from "$components/select-avatar.svelte";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";

  const lobby: Lobby = {
    uids: ["nate", "nathan"],
    players: [
      { alive: true, displayName: "Nate", avatar: 5 },
      { alive: true, displayName: "Nathan", avatar: 3 },
      { alive: true, displayName: "HHHHHHHHHH", avatar: 9 },
    ],
    state: "WAIT",
  };
</script>

<div class="wrapper">
  <SelectAvatar {lobby} />
</div>

<style>
  .wrapper {
    position: fixed;
    top: 20vh;
    bottom: 20vh;
    left: 20vw;
    right: 20vw;
  }
</style>
