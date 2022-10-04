<script lang="ts">
  export let prompt: string;
</script>

<div class="wraper">
  <lable class="question" for="answer">{prompt}</lable>

  <input id="answer" type="text" />
</div>

<style>
  .wraper {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    place-items: center;
  }

  .question {
    font-size: 2rem;
    font-weight: bold;
  }

  #answer {
    font-size: 2rem;
    font-weight: bold;
  }
</style>
