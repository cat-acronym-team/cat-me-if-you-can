<script lang="ts">
  import { authStore as user } from "$stores/auth";
  import type { PrivatePlayer, Lobby } from "../../../functions/src/firestore-types/lobby";
  import { onMount } from "svelte";
  import { lobbyReturn } from "$lib/firebase/firestore-functions";
  import { getPrivatePlayerCollection } from "$lib/firebase/firestore-collections";
  import { doc, getDoc } from "firebase/firestore";
  import type { DocumentReference } from "firebase/firestore";

  export let lobbyDocRef: DocumentReference<Lobby>;
  export let lobbyCode: string;
  export let lobby: Lobby;

  let end: "Cat Win" | "Cat Lose" | "Catfish Lose" | "Catfish Win" | null = null;
  let catfishList: string = "";
  let catfishes: string[];
  onMount(async () => {
    // format a string list to have commas and "and" when needed
    const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    // get the list of catfishes from lobby.ts and put them into a variable
    catfishes = lobby.players
      .filter((p) => {
        return p.role == "CATFISH";
      })
      .map((c) => c.displayName);
    catfishList = formatter.format(catfishes);

    // grab the current user's role
    const myRole = (await getDoc(doc(getPrivatePlayerCollection(lobbyDocRef), $user?.uid))).data() as PrivatePlayer;
    // update end variable depending on the winner type and the current player's role
    if (myRole.role == "CAT") {
      if (lobby.winner == "CAT") {
        end = "Cat Win";
      } else if (lobby.winner == "CATFISH") {
        end = "Cat Lose";
      }
    } else {
      if (lobby.winner == "CAT") {
        end = "Catfish Lose";
      } else if (lobby.winner == "CATFISH") {
        end = "Catfish Win";
      }
    }
  });
</script>

<div class="container">
  <!-- Check the user's role and display the correct win or loss page accordingly -->
  {#if end == "Cat Win"}
    <div class="banner">
      <h2>Hooray!</h2>
      <h2>You have sniffed out the cat fish!</h2>
    </div>

    <div class="image">
      <img src="https://www.azpetvet.com/wp-content/uploads/Happy-cat-1024x711.jpg" alt="clown fish" />
    </div>

    <div class="displayname">
      {#if catfishes.length > 1}
        <h2>{catfishList} were sentenced to 9 lives in purrison!</h2>
      {:else}
        <h2>{catfishList} was sentenced to 9 lives in purrison!</h2>
      {/if}
      <!-- {#if isHost} -->
      <button
        on:click={() => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
      <!-- {:else}
        <span class="button">Waiting for Host to Return to Lobby...</span>
      {/if} -->
    </div>
  {:else if end == "Cat Lose"}
    <div class="banner">
      <h2>You have cat to be kitten me!</h2>
      <h2>The impawster was not caught!</h2>
    </div>

    <div class="image">
      <img src="https://pbs.twimg.com/media/EAmr-PAWsAEoiWR.jpg" alt="cat fish" />
    </div>
    <div class="displayname">
      <!-- Check the number of catfish for grammar purposes -->
      {#if catfishes.length > 1}
        <h2>{catfishList} have taken over the litter!</h2>
      {:else}
        <h2>{catfishList} has taken over the litter!</h2>
      {/if}
      <!-- If the player is the host, show the return button -->
      <button
        on:click={() => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
      <!-- Otherwise show a message
        <span class="button">Waiting for Host to Return to Lobby...</span> -->
    </div>
  {:else if end == "Catfish Win"}
    <div class="banner">
      <h2>O-fish-ally the greatest!</h2>
      <h2>Way to deceive your furry friends!</h2>
    </div>

    <div class="image">
      <img src="https://media.fisheries.noaa.gov/2020-10/blue%20catfish%20face.jpg?VersionId=null" alt="cat fish" />
    </div>

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
      <!-- {#if isHost} -->
      <button
        on:click={() => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
      <!-- <span class="button">Waiting for Host to Return to Lobby...</span> -->
    </div>
  {:else if end == "Catfish Lose"}
    <div class="banner">
      <h2>You have been caught (and released)!</h2>
      <h2>Might as well have been a <b>clown</b> fish...</h2>
    </div>

    <div class="image">
      <img src="https://cdn.drawception.com/drawings/577991/0C653P5Wka.png" alt="clown fish" />
    </div>

    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
      <!-- {#if isHost} -->
      <button
        on:click={() => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
      <!-- {:else}
        <span class="button">Waiting for Host to Return to Lobby...</span>
      {/if} -->
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    height: 90vh;
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

  img {
    width: 100%;
    height: 100%;
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

  .button {
    width: 150px;
    height: 200px;
    font-size: 1.2em;
    font-weight: bold;
    background-color: cornflowerblue;
    color: white;
    padding: 20px;
  }
</style>
