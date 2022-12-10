<script lang="ts">
  import "@material/typography/mdc-typography.scss";
</script>

<header class="header">
  <slot name="help" />
  <slot name="top-right" />
</header>

<slot />

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    height: 100dvh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    gap: 8px;
    top: 8px;
    left: 8px;
    right: 8px;
  }
</style>
