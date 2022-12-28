<script lang="ts">
  import "@material/typography/mdc-typography.scss";
</script>

<slot />

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    height: 100dvh;
  }

  :global(a.mdc-icon-button) {
    color: inherit;
  }
</style>
