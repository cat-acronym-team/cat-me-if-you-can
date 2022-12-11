<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Slider from "@smui/slider";
  import {
    GAME_STATE_DURATIONS_MIN,
    GAME_STATE_DURATIONS_MAX,
    type Lobby,
    type ConfigurableTimer,
  } from "$lib/firebase/firestore-types/lobby";
  import { applyLobbySettings } from "$lib/firebase/firebase-functions";
  import { formatTimer } from "$lib/time";

  export let lobby: Lobby;
  export let lobbyCode: string;
  let errorMessage: string = "";
  let showLobbySettings = false;
  let catfishValue: 1 | 2 | 3 = 1;
  let promptTimerValue = lobby.lobbySettings.promptTime;
  let chatTimerValue = lobby.lobbySettings.chatTime;
  let voteTimerValue = lobby.lobbySettings.voteTime;

  const sliderLabels: { [state in ConfigurableTimer]: string } = {
    PROMPT: "Prompt Timer",
    CHAT: "Chat Timer",
    VOTE: "Vote Timer",
  };

  async function apply() {
    try {
      await applyLobbySettings({
        code: lobbyCode,
        lobbySettings: {
          catfishAmount: catfishValue,
          promptTime: promptTimerValue,
          chatTime: chatTimerValue,
          voteTime: voteTimerValue,
        },
      });
      showLobbySettings = false;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<Dialog
  bind:open={showLobbySettings}
  fullscreen
  aria-labelledby="settings-dialog-title"
  aria-describedby="settings-dialog-content"
  surface$style="max-width: 700px;"
  ><Header>
    <Title id="settings-dialog-title">Lobby Settings</Title>
    <IconButton action="close" class="material-icons">close</IconButton>
  </Header>
  <Content id="settings-dialog-content">
    <div class="settings">
      <label for="catfish-slider">Catfish Amount</label>
      <span class="slider-value">{catfishValue}</span>
      <Slider bind:value={catfishValue} min={1} max={3} step={1} input$id="catfish-slider" />

      <label for="prompt-slider">{sliderLabels.PROMPT}</label>
      <span class="slider-value">{formatTimer(promptTimerValue)}</span>
      <Slider
        bind:value={promptTimerValue}
        min={GAME_STATE_DURATIONS_MIN.PROMPT}
        max={GAME_STATE_DURATIONS_MAX.PROMPT}
        step={5}
        input$id="prompt-slider"
      />

      <label for="chat-slider">{sliderLabels.CHAT}</label>
      <span class="slider-value">{formatTimer(chatTimerValue)}</span>
      <Slider
        bind:value={chatTimerValue}
        min={GAME_STATE_DURATIONS_MIN.CHAT}
        max={GAME_STATE_DURATIONS_MAX.CHAT}
        step={5}
        input$id="chat-slider"
      />

      <label for="vote-slider">{sliderLabels.VOTE}</label>
      <span class="slider-value">{formatTimer(voteTimerValue)}</span>
      <Slider
        bind:value={voteTimerValue}
        min={GAME_STATE_DURATIONS_MIN.VOTE}
        max={GAME_STATE_DURATIONS_MAX.VOTE}
        step={5}
        input$id="vote-slider"
      />
    </div>
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
    {/if}
  </Content>
  <Actions class="settings">
    <Button on:click={() => apply()} action=""><Label>Apply Settings</Label></Button>
  </Actions>
</Dialog>

<IconButton on:click={() => (showLobbySettings = true)} class="material-icons">settings</IconButton>

<style>
  .settings {
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "catfish-label catfish-slider catfish-value"
      "prompt-label prompt-slider prompt-value"
      "chat-label chat-slider chat-value"
      "vote-label vote-slider vote-value";
  }

  .slider-value {
    justify-self: end;
    grid-column: -2 / -1;
  }

  @media (max-width: 550px) {
    .settings {
      grid-template-columns: 1fr auto;
      grid-template-areas:
        "catfish-label catfish-value"
        "catfish-slider catfish-slider"
        "prompt-label prompt-value"
        "prompt-slider prompt-slider"
        "chat-label chat-value"
        "chat-slider chat-slider"
        "vote-label vote-value"
        "vote-slider vote-slider";
    }
  }

  label[for="catfish-slider"] {
    grid-area: catfish-label;
  }

  label[for="catfish-slider"] + .slider-value {
    grid-area: catfish-value;
  }

  label[for="catfish-slider"] + .slider-value + :global(.mdc-slider) {
    grid-area: catfish-slider;
  }

  label[for="prompt-slider"] {
    grid-area: prompt-label;
  }

  label[for="prompt-slider"] + .slider-value {
    grid-area: prompt-value;
  }

  label[for="prompt-slider"] + .slider-value + :global(.mdc-slider) {
    grid-area: prompt-slider;
  }

  label[for="chat-slider"] {
    grid-area: chat-label;
  }

  label[for="chat-slider"] + .slider-value {
    grid-area: chat-value;
  }

  label[for="chat-slider"] + .slider-value + :global(.mdc-slider) {
    grid-area: chat-slider;
  }

  label[for="vote-slider"] {
    grid-area: vote-label;
  }

  label[for="vote-slider"] + .slider-value {
    grid-area: vote-value;
  }

  label[for="vote-slider"] + .slider-value + :global(.mdc-slider) {
    grid-area: vote-slider;
  }
</style>
