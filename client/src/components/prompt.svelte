<script lang="ts">
  import { getPromptAnswerCollection } from "$lib/firebase/firestore-collections";
  import { doc, setDoc } from "firebase/firestore";

  export let prompt: string;

  export let uid: string;

  export let lobbyCode: string;

  let answer = "";

  $: anserDoc = doc(getPromptAnswerCollection(lobbyCode), uid);

  $: error = getErrorMessage(answer);

  function getErrorMessage(answer: string): string | undefined {
    const trimmed = answer.trim();

    if (trimmed.length === 0) {
      return "Please enter an answer";
    }

    if (trimmed.length < 3) {
      return "Your answer must be at least 3 characters";
    }

    if (trimmed.length > 50) {
      return "Answer must be less than 50 characters";
    }
  }

  function submitAnswer() {
    if (error != undefined) {
      return;
    }

    setDoc(anserDoc, { answer });
  }
</script>

<form class="wraper" on:submit|preventDefault={submitAnswer}>
  <label class="question" for="prompt-answer">{prompt}</label>

  <div class="input">
    <input id="prompt-answer" type="text" bind:value={answer} />
    <label class="error" for="prompt-answer">{error ?? ""}</label>
    <button type="submit" disabled={error != undefined}>Done</button>
  </div>
</form>

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

  .input {
    display: grid;
    grid-template:
      "input done" auto
      "error none" auto
      / auto auto;
    gap: 0 8px;
  }

  #prompt-answer {
    grid-area: input;
    font-size: 2rem;
    font-weight: bold;
  }

  .error {
    grid-area: error;
    display: block;
    height: 16px;
    color: red;
  }

  button {
    grid-area: done;
  }
</style>
