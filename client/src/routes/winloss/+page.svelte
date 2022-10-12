<script lang="ts">
  import type { Player, Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby"

  let end:string = "";
  let aliveCount = 0;
  let aliveCatCount = 0;
  let displayname = "";

  /*
  // function to count the number of players currently alive
  function numAlive {
    for(let i = 0; i < Lobby.Player.count; i++) {
      if(players:Player[i].alive == true) {
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
  // set conditions for the game to be declared a win or loss
  function winCondition {
    if(// current player is cat) {
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

  <div class="banner">
    <!--{#if end = "Cat Win"}-->
    <!--
   <h2>Hooray!</h2>
   <h2>You have sniffed out the cat fish!</h2>
   </div>

    <div class="image"></div>

    <div class="displayname">
      <h2>(bind:value={displayname}) was sentenced to 9 lives in purrison!</h2>
    </div>
  -->
  <!--(#if end = "Cat Lose")-->
  <!--
    <h2>You have cat to be kitten me!</h2>
    <h2>The impawster was not caught!</h2>
   </div>

    <div class="image"></div>

    <div class="displayname">
      <h2>bind:value={displayname} has taken over the litter!</h2>
    </div>
  -->
  <!--(#if end = "Catfish Win")-->
    <!-- 
    <h2>O-fish-ally the greatest!</h2>
    <h2>Way to deceive your furry friends!</h2>
   </div>

    <div class="image"></div>

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
    </div> 
  -->

  <!--(#if end = "Catfish Lose")-->
  <!--     
    <h2>You have been caught (and released)!</h2>
    <h2>Might as well have been a <span>clown</span> fish...</h2>
   </div>

    <div class="image"></div>

    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
    </div> 
    -->
</div>

<style>
  .container {
    position: relative;
    height: 100vh;
  }

  .banner {
    position: absolute;
    width: 60%;
    top: 10%;
    left: 20%;
    text-align: center;
    font-size: 2.1em;
  }

  .image {
    position: absolute;
    width: 20%;
    height: 30%;
    top: 35%;
    left: 40%;
    border: 2px solid black;
  }

  .displayname {
    position: absolute;
    width: 80%;
    top: 75%;
    left: 15%;
    font-size: 2.1em;
  }

  span {
    font-weight: bold;
  }
</style>