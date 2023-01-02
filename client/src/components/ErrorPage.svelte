<script lang="ts">
  export let heading: string;
  export let body: string;
</script>

<svelte:head>
  <!-- tell google search not to index error pages -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main>
  <h1 class="mdc-typography--headline1">{heading}</h1>
  <p class="mdc-typography--body1">{body}</p>
  <slot name="button" />
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
