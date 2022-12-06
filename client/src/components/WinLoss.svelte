<script lang="ts">
  import type { Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { authStore as user } from "$stores/auth";
  import { lobbyReturn } from "$lib/firebase/firebase-functions";

  export let lobbyCode: string;
  export let lobby: Lobby;
  export let privatePlayer: PrivatePlayer;

  let end: "Cat Win" | "Cat Lose" | "Catfish Lose" | "Catfish Win" | null = null;
  let catfishList: string = "";
  let catfishes: string[];
  let isHost: boolean;

  // check if the user is the host
  $: if ($user !== null) {
    if (lobby.uids.indexOf($user.uid) == 0) {
      isHost = true;
    } else {
      isHost = false;
    }
  }
  // format a string list to have commas and "and" when needed
  const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
  // get the list of catfishes from lobby.ts and put them into a variable
  $: catfishes = lobby.players
    .filter((p) => {
      return p.role == "CATFISH";
    })
    .map((c) => c.displayName);
  $: catfishList = formatter.format(catfishes);

  // update end variable depending on the winner type and the current player's role
  $: if (lobby.winner !== undefined) {
    if (privatePlayer.role == "CAT") {
      if (lobby.winner == "CAT") {
        end = "Cat Win";
      } else {
        end = "Cat Lose";
      }
    } else {
      if (lobby.winner == "CAT") {
        end = "Catfish Lose";
      } else {
        end = "Catfish Win";
      }
    }
  }
</script>

<!-- Scenario 1 -->
<div class="container">
  <!-- Check the user's role and display the correct win or loss page accordingly -->
  {#if privatePlayer.role == "SPECTATOR"}
    <div class="banner">
      {#if end == "Cat Win" || end == "Catfish Lose"}
        <h2>The cats have sniffed out the cat fish!</h2>
        <h2>You will be able to join the next game!</h2>
      {:else if end == "Cat Lose" || end == "Catfish Win"}
        {#if catfishes.length > 1}
          <h2>The impawsters were not caught!</h2>
        {:else}
          <h2>The impawster was not caught!</h2>
        {/if}
        <h2>You will be able to join the next game!</h2>
      {/if}
    </div>
  {:else if end == "Cat Win"}
    <div class="banner">
      <h2>Hooray!</h2>
      <h2>You have sniffed out the cat fish!</h2>
    </div>
    <div class="image">
      <img src="/images/winloss/HappyCat.png" alt="happy cat" />
    </div>
    <div class="displayname">
      <!-- Check the number of catfish for grammar purposes -->
      {#if catfishes.length > 1}
        <h2>{catfishList} were sentenced to 9 lives in purrison!</h2>
      {:else}
        <h2>{catfishList} was sentenced to 9 lives in purrison!</h2>
      {/if}
    </div>
    <!-- Scenario 2 -->
  {:else if end == "Cat Lose"}
    <div class="banner">
      <h2>You have cat to be kitten me!</h2>
      {#if catfishes.length > 1}
        <h2>The impawsters were not caught!</h2>
      {:else}
        <h2>The impawster was not caught!</h2>
      {/if}
    </div>
    <div class="image">
      <img src="/images/winloss/SadCat.png" alt="sad cat" />
    </div>
    <div class="displayname">
      <!-- Check the number of catfish for grammar purposes -->
      {#if catfishes.length > 1}
        <h2>{catfishList} have taken over the litter!</h2>
      {:else}
        <h2>{catfishList} has taken over the litter!</h2>
      {/if}
    </div>
    <!-- Scenario 3 -->
  {:else if end == "Catfish Win"}
    <div class="banner">
      <h2>O-fish-ally the greatest!</h2>
      <h2>Way to deceive your furry friends!</h2>
    </div>

    <div class="image">
      <img src="/images/winloss/Catfish.png" alt="cat fish" />
    </div>

    <div class="displayname">
      <h2>You have successfully taken over the litter!</h2>
    </div>
    <!-- Scenario 4 -->
  {:else if end == "Catfish Lose"}
    <div class="banner">
      <h2>You have been caught (and released) !</h2>
      <h2>Might as well have been a <b>clown</b> fish...</h2>
    </div>
    <div class="image">
      <img src="/images/winloss/Clownfish.png" alt="clown fish" />
    </div>
    <div class="displayname">
      <h2>You should go back to your sea ani-anim-aneme... home</h2>
    </div>
  {/if}
  <!-- If the player is the host, show the return button -->
  <div class="buttonContainer">
    {#if isHost}
      <button
        id="return"
        on:click={() => {
          lobbyReturn({ code: lobbyCode });
        }}>Return to Lobby</button
      >
    {:else}
      <!-- Otherwise show a message -->
      <span class="button">Waiting for host to return to lobby...</span>
    {/if}
  </div>
</div>

<style>
  .container {
    position: relative;
    height: 90vh;
  }

  .banner {
    position: absolute;
    width: 80%;
    top: 5%;
    left: 10%;
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

  .buttonContainer {
    position: absolute;
    width: 40%;
    top: 85%;
    left: 30%;
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
    width: 300px;
    height: 100px;
    font-size: 1.2em;
    font-weight: bold;
    background-color: cornflowerblue;
    color: white;
    padding: 35px;
  }
</style>
