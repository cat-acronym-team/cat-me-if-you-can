<script lang="ts">
  import question from "$lib/assets/question-mark.svg";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div
  class="question-container"
  on:click={() => {
    dispatch("clicked");
  }}
>
  <img src={question} alt="question mark" />
</div>

<style>
  .question-container {
    width: 7%;
    padding: 5px;
  }
  .question-container img {
    width: 100%;
    object-fit: cover;
  }
  /* Desktop Styles */
  @media only screen and (min-width: 1000px) {
    .question-container {
      width: 3%;
    }
  }
</style>
