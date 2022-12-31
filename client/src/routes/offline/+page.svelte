<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Mdi from "$components/Mdi.svelte";
  import { mdiRefresh } from "@mdi/js";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  /** true if the user is offline false if the user has some other connection issue */
  let offline = true;

  onMount(() => {
    offline = !navigator.onLine;

    // if the user navigates to `/offline` manually, redirect them to `/`
    const url = new URL(window.location.href);
    if (url.pathname == "/offline") {
      goto("/", { replaceState: true });
    }
  });

  function reload() {
    window.location.reload();
  }
</script>

<!-- when the browser comes online automatically reload the page -->
<svelte:window on:online={reload} on:offline={() => (offline = true)} />

<svelte:head>
  <!-- tell google search not to index the offline page -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main>
  <h1 class="mdc-typography--headline1">Oh no!</h1>
  <p class="mdc-typography--body1">
    {#if offline}
      It looks like you're offline. Please check your internet connection and try again.
    {:else}
      There was a connection issue. Please check your internet connection and try again.
    {/if}
  </p>
  <Button on:click={reload} variant="raised">
    <Mdi path={mdiRefresh} />
    <Label>Try Again</Label>
  </Button>
</main>

<style>
  main {
    box-sizing: border-box;
    min-height: 100dvh;
    padding: 24px;
    display: grid;
    justify-items: center;
    align-content: center;
    text-align: center;
  }

  h1 {
    margin-top: 0;
  }
</style>
