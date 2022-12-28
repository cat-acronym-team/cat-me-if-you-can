<script lang="ts">
  export let imageSrc: string;
  export let imageAlt: string;
</script>

<div class="wrapper">
  <p class="banner mdc-typography--headline4"><slot name="banner" /></p>

  <img src={imageSrc} alt={imageAlt} />
  <p class="image-subtext mdc-typography--headline3"><slot name="image-subtext" /></p>

  <p class="description mdc-typography--headline4"><slot name="description" /></p>
</div>

<style>
  * {
    margin: 0;
  }

  .wrapper {
    box-sizing: border-box;
    height: 100%;
    padding: 24px;
    padding-top: 0;
    display: grid;
    grid-template-rows: 1fr auto auto 1fr;
    gap: 24px;
    place-items: center;
    text-align: center;
  }

  .banner,
  .description {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    line-height: 1.25em;
  }

  img {
    width: min(max(256px, 37.5vh), 75vw);
  }

  .image-subtext {
    font-size: clamp(1.5rem, 6vw, 3rem);
    line-height: 1.25em;
  }
</style>
