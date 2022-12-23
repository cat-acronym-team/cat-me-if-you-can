<script lang="ts">
  import "@material/typography/mdc-typography.scss";
</script>

<slot />

<style>
  @import "@fontsource/roboto/300";
  @import "@fontsource/roboto/400";
  @import "@fontsource/roboto/500";
  @import "@fontsource/roboto/700";
  @import "@fontsource/roboto-mono";

  :global(body) {
    margin: 0;
    height: 100vh;
    height: 100dvh;
  }

  :global(a.mdc-icon-button) {
    color: inherit;
  }
</style>
