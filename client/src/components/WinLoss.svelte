<script lang="ts">
  import { authStore as user } from "$stores/auth";
  import type { PrivatePlayer, Lobby } from "../../../functions/src/firestore-types/lobby";
  import { onMount } from "svelte";
  import { getPrivatePlayer, lobbyReturn } from "$lib/firebase/winloss";

  export let lobbyCode: string;
  export let privatePlayer: PrivatePlayer | undefined;
  export let lobby: Lobby | undefined;
  let lobbyRoles: PrivatePlayer | undefined;

  let end: "Cat Win" | "Cat Lose" | "Catfish Lose" | "Catfish Win" | null = null;
  let catfishDisplayname: string[] = []; // catfish's dislplay name used in the html lobbyCode
  let catfishList: string = "";
  let catfishCounter = 0;

  onMount(async () => {
    let aliveCatCount = 0;
    // function to count the number of players currently alive
    if (lobby !== undefined) {
      for (let i = 0; i < lobby.uids.length; i++) {
        if (lobby.players[i].alive == true) {
          // count the number of remaining players who are alive
          lobbyRoles = await getPrivatePlayer(lobbyCode, lobby.uids[i]);
          if (lobbyRoles !== undefined) {
            if (lobbyRoles.role == "CAT") {
              aliveCatCount++;
              // within the alive players, count the number that are cats
            } else {
              catfishDisplayname[catfishCounter] = lobby.players[i].displayName; // create a list of catfishes
              catfishCounter++;
            }
          }
        }
      }
    }
    let aliveCatFishCount = catfishCounter + 1;
    const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    catfishList = formatter.format(catfishDisplayname);
    // any other player who is alive and not a cat is a catfish
    if ($user !== null) {
      // set conditions for the game to be declared a win or loss
      if (privatePlayer !== undefined) {
        if (privatePlayer.role == "CAT") {
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
  });
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
      {#if catfishDisplayname.length > 1}
        <h2>{catfishList} were sentenced to 9 lives in purrison!</h2>
      {:else}
        <h2>{catfishList} was sentenced to 9 lives in purrison!</h2>
      {/if}
      {#if lobby !== undefined}
        <button on:click={() => lobbyReturn(lobbyCode)}>Return to Lobby</button>
        <!-- TODO: invoke function properly -->
      {/if}
    </div>
  {:else if (end = "Cat Lose")}
    <div class="banner">
      <h2>You have cat to be kitten me!</h2>
      <h2>The impawster was not caught!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>{catfishList} has taken over the litter!</h2>
      <button on:click={() => lobbyReturn(lobbyCode)}>>Return to Lobby</button>
    </div>
  {:else if (end = "Catfish Win")}
    <div class="banner">
      <h2>O-fish-ally the greatest!</h2>
      <h2>Way to deceive your furry friends!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
      <button on:click={() => lobbyReturn(lobbyCode)}>Return to Lobby</button>
    </div>
  {:else if (end = "Catfish Lose")}
    <div class="banner">
      <h2>You have been caught (and released)!</h2>
      <h2>Might as well have been a <b>clown</b> fish...</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
      <button on:click={() => lobbyReturn}>Return to Lobby</button>
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
