<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import CharacterCounter from "@smui/textfield/character-counter";
  import { getPromptAnswerCollection } from "$lib/firebase/firestore-collections";
  import { doc, setDoc } from "firebase/firestore";

  export let prompt: string | undefined;

  export let uid: string;

  export let lobbyCode: string;

  let errorMessage: string | undefined;

  let answer = "";
  let dirty = false;

  $: answerDoc = doc(getPromptAnswerCollection(lobbyCode), uid);

  $: validationError = getErrorMessage(answer);

  function getErrorMessage(answer: string): string | undefined {
    const trimmed = answer.trim();

    if (trimmed.length === 0) {
      return "Please enter an answer";
    }

    if (trimmed.length > 50) {
      return "Answer must be less than 50 characters";
    }
  }
  let displayAnswer = "";
  async function submitAnswer() {
    if (validationError != undefined) {
      return;
    }
    errorMessage = undefined;
    try {
      answer = answer.trim();
      await setDoc(answerDoc, { answer });
      displayAnswer = answer;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
  }
</script>

<form class="wraper" on:submit|preventDefault={submitAnswer}>
  <label class="mdc-typography--headline5" for="prompt-answer">{prompt ?? "Loading prompt..."}</label>

  <div class="input">
    <Textfield
      textarea
      input$id="prompt-answer"
      input$maxlength={50}
      bind:value={answer}
      bind:dirty
      invalid={dirty && validationError != undefined}
      required
    >
      <HelperText validationMsg slot="helper">{validationError ?? ""}</HelperText>
      <CharacterCounter slot="internalCounter">0 / 100</CharacterCounter>
    </Textfield>

    <div class="button-wraper">
      <Button type="submit" disabled={validationError != undefined}><Label>Done</Label></Button>
    </div>
    {#if errorMessage != undefined}
      <p class="error">{errorMessage}</p>
    {/if}
  </div>
  {#if displayAnswer != ""}
    <p>Your Answer: {displayAnswer}</p>
  {/if}
</form>

<style>
  .wraper {
    height: 100%;
    padding-inline: 36px;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    place-items: center;
  }

  .input :global(.mdc-text-field) {
    width: min(calc(100vw - 96px), 600px);
  }

  .button-wraper {
    display: grid;
    justify-content: end;
  }
</style>
