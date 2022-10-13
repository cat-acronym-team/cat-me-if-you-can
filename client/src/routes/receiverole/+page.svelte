<script lang="ts">
  import { Player, Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby";

  var numCatFish = 0;
  var check: number[];
  var current = 0;
  function assignRole() {
    for (let i = 0; i < numCatFish; i++) {
      current = Math.floor(Math.random() * (Player.count - 1) + 0);
      if (check.indexOf(current) === -1) {
        check.push(current);
      } else i--;
    }
    for (let j = 0; j < Player.length; j++) {
      if (check.indexOf(j) === -1) {
        Player[j].Role == "CAT";
      } else {
        Player[j].role == "CATFISH";
      }
    }
  }
</script>
