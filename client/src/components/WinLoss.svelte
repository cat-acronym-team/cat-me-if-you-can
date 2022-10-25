<script lang="ts">
  import { authStore as user } from "$stores/auth";
  import type { PrivatePlayer, Lobby } from "../../../functions/src/firestore-types/lobby";
  import { onMount } from "svelte";
  import { lobbyReturn, getLobbyRole } from "$lib/firebase/firestore-functions";
  import type { ErrorResponse, LobbyRoleResponse } from "$lib/firebase/firestore-functions-types";

  export let lobbyCode: string;
  export let privatePlayer: PrivatePlayer;
  export let lobby: Lobby;

  let end: "Cat Win" | "Cat Lose" | "Catfish Lose" | "Catfish Win" | null = null;
  let catfishList: string = "";
  let catfishDisplayname: string[] = [];
  let isHost: boolean = false;

  // check if the player is host aka the first uid in the uids array
  if ($user !== null)
    if (lobby.uids.indexOf($user.uid) == 0) {
      isHost = true;
    }

  function findResult(privatePlayer: PrivatePlayer, catCount: number, catfishCount: number) {
    const { role } = privatePlayer;
    if (role == "CAT") {
      if (catfishCount == 0) {
        return "Cat Win";
      }
      if (catCount <= catfishCount) {
        return "Cat Lose";
      }
    } else {
      if (catfishCount >= catCount) {
        return "Catfish Win";
      }
      if (catfishCount == 0) {
        return "Catfish Lose";
      }
    }
    return null;
  }

  onMount(async () => {
    // function to count the number of players currently alive
    let gameInfo = await getLobbyRole({ code: lobbyCode }); // grabs return statement from function as an object
    if ("error" in (gameInfo.data as ErrorResponse)) {
      console.log("Error occurred!");
    }
    const response = gameInfo.data as LobbyRoleResponse;
    let aliveCatCount = response.aliveCatCount; // number of cats that are currently alive
    let catfishDisplayname = response.catfishDisplayname; // catfish's dislplay name used in the html lobbyCode

    let aliveCatFishCount = catfishDisplayname.length;
    const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    catfishList = formatter.format(catfishDisplayname);
    // any other player who is alive and not a cat is a catfish
    if ($user !== null) {
      // set conditions for the game to be declared a win or loss
      end = findResult(privatePlayer, aliveCatCount, aliveCatFishCount);
      console.log(end);
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
      <img src="https://picsum.photos/200" alt="clown fish" />
    </div>

    <div class="displayname">
      {#if catfishDisplayname.length > 1}
        <h2>{catfishList} were sentenced to 9 lives in purrison!</h2>
      {:else}
        <h2>{catfishList} was sentenced to 9 lives in purrison!</h2>
      {/if}
      {#if isHost}
        <button
          on:click={() => {
            lobbyReturn({ code: lobbyCode });
          }}>Return to Lobby</button
        >
      {:else}
        <span class="button">Waiting for Host to Return to Lobby...</span>
      {/if}
    </div>
  {:else if end == "Cat Lose"}
    <div class="banner">
      <h2>You have cat to be kitten me!</h2>
      <h2>The impawster was not caught!</h2>
    </div>

    <div class="image">
      <img src="https://picsum.photos/200" alt="cat fish" />
    </div>
    <div class="displayname">
      <h2>{catfishList} has taken over the litter!</h2>
      <!-- If the player is the host, show the return button -->
      {#if isHost}
        <button
          on:click={() => {
            lobbyReturn({ code: lobbyCode });
          }}>Return to Lobby</button
        >
        <!-- Otherwise show a message -->
      {:else}
        <span class="button">Waiting for Host to Return to Lobby...</span>
      {/if}
    </div>
  {:else if end == "Catfish Win"}
    <div class="banner">
      <h2>O-fish-ally the greatest!</h2>
      <h2>Way to deceive your furry friends!</h2>
    </div>

    <div class="image">
      <img src="https://picsum.photos/200" alt="cat fish" />
    </div>

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
      {#if isHost}
        <button
          on:click={() => {
            lobbyReturn({ code: lobbyCode });
          }}>Return to Lobby</button
        >
      {:else}
        <span class="button">Waiting for Host to Return to Lobby...</span>
      {/if}
    </div>
  {:else if end == "Catfish Lose"}
    <div class="banner">
      <h2>You have been caught (and released)!</h2>
      <h2>Might as well have been a <b>clown</b> fish...</h2>
    </div>

    <div class="image">
      <img src="https://picsum.photos/200" alt="clown fish" />
    </div>

    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
      {#if isHost}
        <button
          on:click={() => {
            lobbyReturn({ code: lobbyCode });
          }}>Return to Lobby</button
        >
      {:else}
        <span class="button">Waiting for Host to Return to Lobby...</span>
      {/if}
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
