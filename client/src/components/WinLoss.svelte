<script lang="ts">
  import { doc, getDoc } from "firebase/firestore";
  import { getPrivatePlayerCollection, lobbyCollection } from "$lib/firebase/firestore-collections";
  import { authStore as user } from "$stores/auth";
  import type { PrivatePlayer } from "../../../functions/src/firestore-types/lobby";
  import { onMount } from "svelte";

  export let code: string;

  let end: string = "";
  let aliveCount = 0;
  let aliveCatCount = 0;
  let catfishDisplayname = "";
  let currentRole: PrivatePlayer; // the player's current role
  let lobbyRoles: PrivatePlayer; // cycle through the lobby and retrieve their roles

  function lobbyReturn() {
      // TODO: change gamestate back to lobby
      console.log("Returned to lobby");
  }
  onMount (async () => {
    const lobby = doc(lobbyCollection, code);
    const validLobby = await getDoc(lobby);

    if (!validLobby.exists()) {
      throw new Error("Invalid Lobby");
    }

    const { uids, players } = validLobby.data();

    // function to count the number of players currently alive
    for (let i = 0; i < uids.length; i++) {
      if (players[i].alive == true) {
        aliveCount++;
        // count the number of remaining players who are alive
        let privatePlayer = await getDoc(doc(getPrivatePlayerCollection(lobby), uids[i]));
        lobbyRoles = privatePlayer.data() as PrivatePlayer;

        if (lobbyRoles.role == "CAT") {
          aliveCatCount++;
          // within the alive players, count the number that are cats
        } else {
          catfishDisplayname = players[i].displayName;
        }
      }
    }
    let aliveCatFishCount = aliveCount - aliveCatCount;
    // any other player who is alive and not a cat is a catfish
    if ($user !== null) {
      const currentPlayer = await getDoc(doc(getPrivatePlayerCollection(lobby), $user.uid));
      currentRole = currentPlayer.data() as PrivatePlayer;

      // set conditions for the game to be declared a win or loss
      if (currentRole.role == "CAT") {
        if (aliveCatFishCount == 0) {
          end = "Cat Win";
        } else if (aliveCatCount == aliveCatFishCount) {
          end = "Cat Lose";
        }
      } else {
        if (aliveCatFishCount == 0) {
          end = "Catfish Lose";
        } else if (aliveCatCount == aliveCatFishCount) {
          end = "Catfish Win";
        }
      }
    }
  }
</script>

<div class="container">
  <!-- Check the user's role and display the correct win or loss page accordingly -->
  {#if (end = "Cat Win")}
    <div class="banner">
      <h2>Hooray!</h2>
      <h2>You have sniffed out the cat fish!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>{catfishDisplayname} was sentenced to 9 lives in purrison!</h2>
      <button on:click={lobbyReturn}>Return to Lobby</button>
    </div>
  {/if}
  {#if (end = "Cat Lose")}
    <div class="banner">
      <h2>You have cat to be kitten me!</h2>
      <h2>The impawster was not caught!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>{catfishDisplayname} has taken over the litter!</h2>
      <button on:click={lobbyReturn}>Return to Lobby</button>
    </div>
  {/if}
  {#if (end = "Catfish Win")}
    <div class="banner">
      <h2>O-fish-ally the greatest!</h2>
      <h2>Way to deceive your furry friends!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
      <button on:click={lobbyReturn}>Return to Lobby</button>
    </div>
  {/if}
  {#if (end = "Catfish Lose")}
    <div class="banner">
      <h2>You have been caught (and released)!</h2>
      <h2>Might as well have been a <b>clown</b> fish...</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
      <button on:click={lobbyReturn}>Return to Lobby</button>
    </div>
  {/if}
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
    top: 67.5%;
    left: 10%;
    font-size: 2.1em;
    text-align: center;
  }

  button {
    width: 300px;
    height: 100px;
    font-size: 1.2em;
    font-weight: bold;
    background-color: cornflowerblue;
    color: white;
  }
</style>
