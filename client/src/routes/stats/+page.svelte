<script lang="ts">
  import { authStore } from "$stores/auth";
  import type { Stats, UserData } from "$lib/firebase/firestore-types/users";
  import { getUserStatsCollection } from "$lib/firebase/firestore-collections";
  import { doc, getDoc } from "firebase/firestore";
  import { getUser } from "$lib/firebase/splash";

  // variables
  let user = $authStore;
  let displayName: string | undefined;
  let stats: Stats | undefined = undefined;
  let totalPlayed: number;
  let catLosses: number;
  let catfishLosses: number;
  // reactive calls
  $: if (user !== null) {
    getInfo();
  }
  $: if (stats !== undefined) {
    totalPlayed = stats.playedAsCat + stats.playedAsCatfish;
    catLosses = stats.playedAsCat - stats.catWins;
    catfishLosses = stats.playedAsCatfish - stats.catfishWins;
  }

  // function
  async function getInfo() {
    if (user !== null) {
      const { displayName: name } = (await getUser(user.uid)) as UserData;
      const statsSnapshot = await getDoc(doc(getUserStatsCollection(user.uid), user.uid));
      displayName = name;
      stats = statsSnapshot.data();
    }
  }
</script>

{#if stats !== undefined && displayName !== undefined}
  <h1>{displayName} Stats</h1>
  <div class="stats-container">
    <div class="stat total">
      <h3>Total Games Played</h3>
      <output>{totalPlayed}</output>
    </div>
    <div class="stat">
      <h3>Cat Wins</h3>
      <output>{stats.catWins}</output>
    </div>
    <div class="stat">
      <h3>Cat Losses</h3>
      <output>{catLosses}</output>
    </div>
    <div class="stat">
      <h3>Catfish Wins</h3>
      <output>{stats.catfishWins}</output>
    </div>
    <div class="stat">
      <h3>Catfish Losses</h3>
      <output>{catfishLosses}</output>
    </div>
    <div class="stat">
      <h3>Win/Loss Ratio as Cat</h3>
      <output>{(stats.catWins / catLosses).toFixed(2)}</output>
    </div>
    <div class="stat">
      <h3>Win/Loss Ratio as Catfish</h3>
      <output>{(stats.catfishWins / catfishLosses).toFixed(2)}</output>
    </div>
  </div>
{:else}
  Loading...
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
  .stats-container {
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
    .stats-container {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
