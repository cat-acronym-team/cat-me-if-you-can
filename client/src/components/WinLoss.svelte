<script lang="ts">
  import { authStore as user } from "$stores/auth";
  import type { PrivatePlayer, Lobby } from "../../../functions/src/firestore-types/lobby";
  import { onMount } from "svelte";
  import { lobbyReturn, getLobbyRole } from "$lib/firebase/firestore-functions";
  import type { ErrorResponse, LobbyRoleResponse } from "$lib/firebase/firestore-functions-types";

  export let lobbyCode: string;
  export let privatePlayer: PrivatePlayer | undefined;
  export let lobby: Lobby | undefined;

  let end: "Cat Win" | "Cat Lose" | "Catfish Lose" | "Catfish Win" | null = null;
  let catfishList: string = "";
  let catfishDisplayname: string[] = [];

  function findResult(privatePlayer: PrivatePlayer, catCount: number, catfishCount: number) {
    const { role } = privatePlayer;
    if (role == "CAT") {
      if (catfishCount == 0) {
        return "Cat Win";
      }
      if (catCount == catfishCount) {
        return "Cat Lose";
      }
      if (catCount < catfishCount) {
        return "Cat Lose";
      }
    } else {
      if (catCount == 0) {
        return "Catfish Win";
      }
      if (catfishCount == catCount) {
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
    if (lobby !== undefined) {
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
        if (privatePlayer !== undefined) {
          end = findResult(privatePlayer, aliveCatCount, aliveCatFishCount);
        }
        console.log(end);
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

    <div class="image" />

    <div class="displayname">
      {#if catfishDisplayname.length > 1}
        <h2>{catfishList} were sentenced to 9 lives in purrison!</h2>
      {:else}
        <h2>{catfishList} was sentenced to 9 lives in purrison!</h2>
      {/if}
      {#if lobby !== undefined}
        <button
          on:click={async () => {
            lobbyReturn({ code: lobbyCode });
          }}>Return to Lobby</button
        >
      {/if}
    </div>
  {:else if end == "Cat Lose"}
    <div class="banner">
      <h2>You have cat to be kitten me!</h2>
      <h2>The impawster was not caught!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>{catfishList} has taken over the litter!</h2>
      <button
        on:click={async () => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
    </div>
  {:else if end == "Catfish Win"}
    <div class="banner">
      <h2>O-fish-ally the greatest!</h2>
      <h2>Way to deceive your furry friends!</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
      <button
        on:click={async () => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
    </div>
  {:else if end == "Catfish Lose"}
    <div class="banner">
      <h2>You have been caught (and released)!</h2>
      <h2>Might as well have been a <b>clown</b> fish...</h2>
    </div>

    <div class="image" />

    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
      <button
        on:click={async () => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
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
