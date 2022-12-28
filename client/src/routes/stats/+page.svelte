<script lang="ts">
  import IconButton from "@smui/icon-button";
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

  let errorMessage: string = "";

  onMount(() => {
    const userId = $page.url.searchParams.get("user");

    if (userId !== null) {
      unsubscribeUser = onSnapshot(
        doc(userCollection, userId),
        (userDoc) => {
          userInfo = userDoc.data();
        },
        (err) => {
          console.error(err);
          errorMessage = err instanceof Error ? err.message : String(err);
        }
      );
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

<Header>
  <IconButton slot="top-left" class="material-icons" href="/">arrow_back</IconButton>
</Header>

<main>
  {#if errorMessage !== ""}
    <p class="error">{errorMessage}</p>
  {/if}
  {#if $user == null}
    <div class="spinner-wraper">
      <CircularProgress indeterminate />
    </div>
  {:else if userInfo == undefined}
    <h1 class="mdc-typography--headline2">Sad Kitty... No Stats Here</h1>
  {:else}
    <h1 class="mdc-typography--headline2">{userInfo.displayName} Stats</h1>
    <div class="user-info-container">
      <div class="totals">
        <label class="mdc-typography--headline4">
          Total Games Played
          <output>{totalPlayed}</output>
        </label>
        <label class="mdc-typography--headline4">
          Total Win/Loss Ratio
          <output>{isNaN(totalWinRatio) || !isFinite(totalWinRatio) ? "N/A" : totalWinRatio.toFixed(2)}</output>
        </label>
      </div>
      <label class="mdc-typography--headline4">
        Cat Wins
        <output>{userInfo.catWins}</output>
      </label>
      <label class="mdc-typography--headline4">
        Cat Losses
        <output>{catLosses}</output>
      </label>
      <label class="mdc-typography--headline4">
        Games Played As Cat
        <output>{userInfo.playedAsCat}</output>
      </label>
      <label class="mdc-typography--headline4">
        Win/Loss Ratio as Cat
        <output>{isNaN(catRatio) || !isFinite(catRatio) ? "N/A" : catRatio.toFixed(2)}</output>
      </label>
      <label class="mdc-typography--headline4">
        Catfish Wins
        <output>{userInfo.catfishWins}</output>
      </label>
      <label class="mdc-typography--headline4">
        Catfish Losses
        <output>{catfishLosses}</output>
      </label>
      <label class="mdc-typography--headline4">
        Games Played As Catfish
        <output>{userInfo.playedAsCatfish}</output>
      </label>
      <label class="mdc-typography--headline4">
        Win/Loss Ratio as Catfish
        <output>{isNaN(catfishRatio) || !isFinite(catfishRatio) ? "N/A" : catfishRatio.toFixed(2)}</output>
      </label>
    </div>
  {/if}
</main>

<style>
  main {
    box-sizing: border-box;
    height: 100%;
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
  }

  .user-info-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: auto;
    text-align: center;
    gap: 24px;
  }

  .totals {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column: 1/-1;
    text-align: center;
    gap: 24px;
  }

  label {
    display: grid;
    gap: 12px;
  }

  @media (min-width: 1080px) {
    .user-info-container {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
