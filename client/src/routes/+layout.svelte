<script lang="ts">
  import "@material/typography/mdc-typography.scss";

  import smuiLightCssUrl from "../theme/output/smui-light.css?url";
  import smuiDarkCssUrl from "../theme/output/smui-dark.css?url";
</script>

<slot />

<svelte:head>
  <!-- SMUI Styles -->
  <link rel="stylesheet" href={smuiLightCssUrl} media="(prefers-color-scheme: light)" />
  <link rel="stylesheet" href={smuiDarkCssUrl} media="(prefers-color-scheme: dark)" />
</svelte:head>

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
