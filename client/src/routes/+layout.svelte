<script lang="ts">
  import "@material/typography/mdc-typography.scss";
</script>

<header class="header">
  <slot name="help" />
  <slot name="other" />
</header>

<slot />

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    height: 100dvh;
  }

  .top-left {
    position: absolute;
    top: 8px;
    left: 8px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
