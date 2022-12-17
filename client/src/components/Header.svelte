<script lang="ts">
  import Rules from "$components/Rules.svelte";
</script>

<header class="header">
  <slot name="top-left" />
  <Rules />
  <div class="spacer" />
  <slot name="top-right" />
</header>

<style>
  .header {
    display: flex;
    gap: 8px;
    /* justify-content: space-between; */
    align-items: center;
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
  }

  .spacer {
    flex-grow: 1;
  }
</style>
