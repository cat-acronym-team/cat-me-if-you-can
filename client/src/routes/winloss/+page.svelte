<script lang="ts">
  import type { Player, Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby"

  let end:string = "";
  let aliveCount = 0;
  let aliveCatCount = 0;

  /*
  function numAlive {
    for(val i = 0; i < Lobby.Player.count; i++) {
      if(Player[i].alive == true) {
        aliveCount++;
        // count the number of remaining players who are alive
        if(PrivatePlayer[i].Role = "CAT") {
          aliveCatCount++;
          // within the alive players, count the number that are cats
        }
      }
    }
  }

  let aliveCatFishCount = aliveCount - aliveCatCount;
  // any other player who is alive and not a cat is a catfish
  */
  /*
  function winCondition {
    if(current player is cat) {
      if(aliveCatFishCount == 0) {
        end = "Cat Win";
      }
      else if(aliveCatCount == aliveCatFishCount) {
        end = "Cat Lose";
      }
    }
    else {
      if(aliveCatFishCount == 0) {
        end = "Catfish Lose";
      }
      else if(aliveCatCount == aliveCatFishCount) {
        end = "Catfish Win";
      }
    }
  }
  */
</script>

<div class="container">
<!--
  <div class="banner">
    {#if end = "Cat Win"} {

    }

    {#if end = "Cat Lose"} {

    }

    {#if end = "Catfish Win"} {

    }

    {#if end = "Catfish Lose"} {

    }
  </div>
-->
</div>