<script lang="ts">
  import ErrorPage from "$components/ErrorPage.svelte";
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

<ErrorPage
  heading="Oh no!"
  body={offline
    ? "It looks like you're offline. Please check your internet connection and try again."
    : "There was a connection issue. Please check your internet connection and try again."}
>
  <Button slot="button" on:click={reload} variant="raised">
    <Mdi path={mdiRefresh} />
    <Label>Try Again</Label>
  </Button>
</ErrorPage>
