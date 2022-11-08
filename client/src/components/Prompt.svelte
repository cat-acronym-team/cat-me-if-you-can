<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { getPromptAnswerCollection } from "$lib/firebase/firestore-collections";
  import { doc, setDoc } from "firebase/firestore";
  import { GAME_STATE_DURATIONS, type Lobby } from "$lib/firebase/firestore-types/lobby";
  import { authStore as user } from "$stores/auth";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  import { formatTimer } from "$lib/time";

  export let prompt: string | undefined;

  export let uid: string;

  export let lobbyCode: string;

  export let lobbyData: Lobby;

  let answer = "";
  let dirty = false;
  let countdown: number = GAME_STATE_DURATIONS.PROMPT;
  let timer: ReturnType<typeof setInterval>;

  $: answerDoc = doc(getPromptAnswerCollection(lobbyCode), uid);

  $: error = getErrorMessage(answer);

  $: if (countdown <= 0 && lobbyData.uids[0] == $user?.uid) {
    clearInterval(timer);
    // call this function so it can continue onto the next state
    verifyExpiration({ code: lobbyCode });
  }

  $: if (countdown <= -5) {
    clearInterval(timer);
    // call this function so it can continue onto the next state
    verifyExpiration({ code: lobbyCode });
  }

  timer = setInterval(() => {
    if (lobbyData.expiration != undefined) {
      const diff = Math.floor((lobbyData.expiration.toMillis() - Date.now()) / 1000);
      countdown = diff;
    }
  }, 500);

  function getErrorMessage(answer: string): string | undefined {
    const trimmed = answer.trim();

    if (trimmed.length === 0) {
      return "Please enter an answer";
    }

    if (trimmed.length > 50) {
      return "Answer must be less than 50 characters";
    }
  }

  function submitAnswer() {
    if (error != undefined) {
      return;
    }

    setDoc(answerDoc, { answer });
  }
</script>

{#if countdown != undefined}
  <h1 class="mdc-typography--headline3" style="text-align:center ;">{formatTimer(countdown)}</h1>
{/if}
<form class="wraper" on:submit|preventDefault={submitAnswer}>
  <label class="mdc-typography--headline5" for="prompt-answer">{prompt ?? "Loading prompt..."}</label>

  <div class="input">
    <Textfield input$id="prompt-answer" bind:value={answer} bind:dirty invalid={dirty && error != undefined} required>
      <HelperText validationMsg slot="helper">{error ?? ""}</HelperText>
    </Textfield>
    <Button type="submit" disabled={error != undefined}><Label>Done</Label></Button>
  </div>
</form>

<style>
  .wraper {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    place-items: center;
  }
</style>
