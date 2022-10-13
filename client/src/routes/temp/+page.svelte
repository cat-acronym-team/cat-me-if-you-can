<script lang="ts">
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import Stalker from "$components/Stalker.svelte";

  const lobby: Lobby = {
    uids: ["player1", "player2", "player3", "player4", "player5", "player6"],
    players: [
      {
        alive: true,
        avatar: 2,
        displayName: "bean",
      },
      {
        alive: true,
        avatar: 2,
        displayName: "soda",
      },
      {
        alive: true,
        avatar: 2,
        displayName: "potato",
      },
      {
        alive: true,
        avatar: 2,
        displayName: "beer",
      },
      {
        alive: true,
        avatar: 2,
        displayName: "water",
      },
      {
        alive: true,
        avatar: 2,
        displayName: "battery",
      },
    ],
    state: "CHAT",
  };
</script>

<Stalker {lobby} />
