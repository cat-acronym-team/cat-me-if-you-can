<script lang="ts">
  import Rules from "$components/Rules.svelte";
</script>

<header class="header">
  <Rules />
  <slot name="top-right" />
</header>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
  }
</style>
