<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import LobbyChat from "./LobbyChat.svelte";
  import { getPromptAnswerCollection } from "$lib/firebase/firestore-collections";
  import { doc, setDoc } from "firebase/firestore";
  import { authStore as user } from "$stores/auth";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";

  export let prompt: string | undefined;

  export let uid: string;

  export let lobbyCode: string;

  export let lobbyData: Lobby;

  let userData = $user;
  let userInfo = lobbyData.players[lobbyData.uids.indexOf(userData?.uid ?? "")];
  let answer = "";
  let dirty = false;

  $: answerDoc = doc(getPromptAnswerCollection(lobbyCode), uid);

  $: error = getErrorMessage(answer);

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

{#if !userInfo.alive}
  <LobbyChat lobby={lobbyData} {lobbyCode} />
{/if}
<form class="wraper" on:submit|preventDefault={submitAnswer}>
  <label class="mdc-typography--headline5" for="prompt-answer">{prompt ?? "Loading prompt..."}</label>

  {#if userInfo.alive}
    <div class="input">
      <Textfield input$id="prompt-answer" bind:value={answer} bind:dirty invalid={dirty && error != undefined} required>
        <HelperText validationMsg slot="helper">{error ?? ""}</HelperText>
      </Textfield>
      <Button type="submit" disabled={error != undefined}><Label>Done</Label></Button>
    </div>
  {/if}
</form>

<style>
  .countdown {
    margin: 0;
    text-align: center;
  }

  .wraper {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    place-items: center;
  }
</style>
