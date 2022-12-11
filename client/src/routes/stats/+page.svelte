<script lang="ts">
  import CircularProgress from "@smui/circular-progress";
  import Header from "$components/Header.svelte";

  import { authStore as user } from "$stores/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { doc, onSnapshot } from "firebase/firestore";
  import { userCollection } from "$lib/firebase/firestore-collections";
  import type { Unsubscribe } from "firebase/auth";
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";

  // variables
  let userInfo: UserData | undefined;
  let unsubscribeUser: Unsubscribe | undefined;
  let totalPlayed: number;
  let totalWinRatio: number;
  let catLosses: number;
  let catfishLosses: number;
  let catRatio: number;
  let catfishRatio: number;

  onMount(() => {
    const userId = $page.url.searchParams.get("user");

    if (userId !== null) {
      unsubscribeUser = onSnapshot(doc(userCollection, userId), (userDoc) => {
        userInfo = userDoc.data();
      });
    }
  });

  $: if (userInfo !== undefined) {
    totalPlayed = userInfo.playedAsCat + userInfo.playedAsCatfish;
    catLosses = userInfo.playedAsCat - userInfo.catWins;
    catfishLosses = userInfo.playedAsCatfish - userInfo.catfishWins;
    catRatio = userInfo.catWins / catLosses;
    catfishRatio = userInfo.catfishWins / catfishLosses;
    totalWinRatio = (userInfo.catWins + userInfo.catfishWins) / (catLosses + catfishLosses);
  }
  // lifecyle methods
  onDestroy(() => {
    unsubscribeUser?.();
  });
</script>

<Header />

<main>
  {#if $user == null}
    <div class="spinner-wraper">
      <CircularProgress indeterminate />
    </div>
  {:else if userInfo == undefined}
    <h1>Sad Kitty... No Stats Here</h1>
  {:else}
    <h1>{userInfo.displayName} Stats</h1>
    <div class="userInfo-container">
      <div class="totals">
        <div>
          <h3>Total Games Played</h3>
          <output>{totalPlayed}</output>
        </div>
        <div>
          <h3>Total Win/Loss Ratio</h3>
          <output>{isNaN(totalWinRatio) || !isFinite(totalWinRatio) ? "N/A" : totalWinRatio.toFixed(2)}</output>
        </div>
      </div>
      <div>
        <h3>Cat Wins</h3>
        <output>{userInfo.catWins}</output>
      </div>
      <div>
        <h3>Cat Losses</h3>
        <output>{catLosses}</output>
      </div>
      <div>
        <h3>Games Played As Cat</h3>
        <output>{userInfo.playedAsCat}</output>
      </div>
      <div>
        <h3>Win/Loss Ratio as Cat</h3>
        <output>{isNaN(catRatio) || !isFinite(catRatio) ? "N/A" : catRatio.toFixed(2)}</output>
      </div>
      <div>
        <h3>Catfish Wins</h3>
        <output>{userInfo.catfishWins}</output>
      </div>
      <div>
        <h3>Catfish Losses</h3>
        <output>{catfishLosses}</output>
      </div>
      <div>
        <h3>Games Played As Catfish</h3>
        <output>{userInfo.playedAsCatfish}</output>
      </div>
      <div>
        <h3>Win/Loss Ratio as Catfish</h3>
        <output>{isNaN(catfishRatio) || !isFinite(catfishRatio) ? "N/A" : catfishRatio.toFixed(2)}</output>
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
    padding-top: 64px;
  }

  main:has(.spinner-wraper) {
    padding: 0;
  }

  .spinner-wraper {
    height: 100%;
    display: grid;
    place-content: center;
    grid-template-columns: 128px;
    grid-template-rows: 128px;
    place-items: stretch;
  }
  h1 {
    text-align: center;
    text-decoration: underline;
    font-size: 2em;
  }
  h3,
  output {
    font-size: 1.3em;
  }
  .userInfo-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 80%;
    margin: auto;
    text-align: center;
  }
  .totals {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column: 1/-1;
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
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
