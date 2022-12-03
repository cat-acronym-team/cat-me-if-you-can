<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Slider from "@smui/slider";
  import FormField from "@smui/form-field";
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
  let catfishValue: number = 1;
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
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
  <Dialog
    bind:open={showLobbySettings}
    fullscreen
    aria-labelledby="settings-dialog-title"
    aria-describedby="settings-dialog-content"
    ><Header>
      <Title id="settings-dialog-title">Lobby Settings</Title>
      <IconButton action="close" class="material-icons">close</IconButton>
    </Header>
    <Content id="settings-dialog-content">
      <div class="settings">
        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={catfishValue}
            min={1}
            max={3}
            step={1}
            id="Catfish Slider"
            input$aria-label="Catfish Slider"
            style={"width:80%;"}
          />
          <span slot="label">Catfish Amount: {catfishValue}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={promptTimerValue}
            min={GAME_STATE_DURATIONS_MIN.PROMPT}
            max={GAME_STATE_DURATIONS_MAX.PROMPT}
            step={5}
            id="Prompt Slider"
            input$aria-label="Prompt Slider"
            style={"width:80%;"}
          />
          <span slot="label">{sliderLabels.PROMPT} {formatTimer(promptTimerValue)}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={chatTimerValue}
            min={GAME_STATE_DURATIONS_MIN.CHAT}
            max={GAME_STATE_DURATIONS_MAX.CHAT}
            step={5}
            id="Chat Slider"
            input$aria-label="Chat Slider"
            style={"width:80%;"}
          />
          <span slot="label">{sliderLabels.CHAT} {formatTimer(chatTimerValue)}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={voteTimerValue}
            min={GAME_STATE_DURATIONS_MIN.VOTE}
            max={GAME_STATE_DURATIONS_MAX.VOTE}
            step={5}
            id="Vote Slider"
            input$aria-label="Vote Slider"
            style={"width:80%;"}
          />
          <span slot="label">{sliderLabels.VOTE} {formatTimer(voteTimerValue)}</span>
        </FormField>
      </div>
    </Content>
    <Actions class="settings">
      <Button on:click={() => apply()}><Label>Apply Settings</Label></Button>
    </Actions>
  </Dialog>
  <Button on:click={() => (showLobbySettings = true)} class="Lobby Settings"><Label>Lobby Settings</Label></Button>
</main>

<style>
  .settings {
    width: 100%;
    display: grid;
    place-items: center;
  }
</style>
