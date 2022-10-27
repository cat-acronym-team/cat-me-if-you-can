<script lang="ts">
  import { authStore } from "$stores/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { getUser } from "$lib/firebase/splash";

  // variables
  let user = $authStore;
  let userInfo: UserData | undefined;
  let totalPlayed: number;
  let catLosses: number;
  let catfishLosses: number;

  // reactive calls
  $: if (user !== null) {
    getInfo();
  }
  $: if (userInfo !== undefined) {
    totalPlayed = userInfo.playedAsCat + userInfo.playedAsCatfish;
    catLosses = userInfo.playedAsCat - userInfo.catWins;
    catfishLosses = userInfo.playedAsCatfish - userInfo.catfishWins;
  }

  // function
  async function getInfo() {
    if (user !== null) {
      userInfo = (await getUser(user.uid)) as UserData;
    }
  }
</script>

{#if userInfo !== undefined}
  <h1>{userInfo.displayName} Stats</h1>
  <div class="userInfo-container">
    <div class="stat total">
      <h3>Total Games Played</h3>
      <output>{totalPlayed}</output>
    </div>
    <div class="stat">
      <h3>Cat Wins</h3>
      <output>{userInfo.catWins}</output>
    </div>
    <div class="stat">
      <h3>Cat Losses</h3>
      <output>{catLosses}</output>
    </div>
    <div class="stat">
      <h3>Catfish Wins</h3>
      <output>{userInfo.catfishWins}</output>
    </div>
    <div class="stat">
      <h3>Catfish Losses</h3>
      <output>{catfishLosses}</output>
    </div>
    <div class="stat">
      <h3>Win/Loss Ratio as Cat</h3>
      <output>{(userInfo.catWins / catLosses).toFixed(2)}</output>
    </div>
    <div class="stat">
      <h3>Win/Loss Ratio as Catfish</h3>
      <output>{(userInfo.catfishWins / catfishLosses).toFixed(2)}</output>
    </div>
  </div>
{:else}
  <h1>Sad Kitty...No Stats Here :(</h1>
{/if}

<style>
  h1 {
    text-align: center;
    text-decoration: underline;
    font-size: 2em;
  }
  h3,
  output {
    font-size: 1em;
  }
  .userInfo-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 80%;
    margin: auto;
    text-align: center;
  }
  .total {
    grid-column: 1 / -1;
    text-align: center;
  }

  @media only screen and (min-width: 1000px) {
    h1 {
      font-size: 3em;
    }
    h3,
    output {
      font-size: 2em;
    }
    .userInfo-container {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
