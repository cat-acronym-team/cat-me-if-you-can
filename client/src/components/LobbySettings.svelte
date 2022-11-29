<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Slider from "@smui/slider";
  import FormField from "@smui/form-field";
  import { GAME_STATE_DURATIONS_MIN, GAME_STATE_DURATIONS_MAX } from "$lib/firebase/firestore-types/lobby";
  import { configurableTimers } from "$lib/firebase/firestore-types/lobby";
  import { applyLobbySettings } from "$lib/firebase/firebase-functions";

  export let lobbyCode: string;
  let errorMessage: string = "";
  let showLobbySettings = false;

  const sliderLabels = new Map([
    ["PROMPT", "Prompt Timer"],
    ["CHAT", "Chat Timer"],
    ["VOTE", "Vote Timer"],
  ]);
  const minimumTimes = new Map([
    ["PROMPT", GAME_STATE_DURATIONS_MIN.PROMPT],
    ["CHAT", GAME_STATE_DURATIONS_MIN.CHAT],
    ["VOTE", GAME_STATE_DURATIONS_MIN.VOTE],
  ]);
  const maximumTimes = new Map([
    ["PROMPT", GAME_STATE_DURATIONS_MAX.PROMPT],
    ["CHAT", GAME_STATE_DURATIONS_MAX.CHAT],
    ["VOTE", GAME_STATE_DURATIONS_MAX.VOTE],
  ]);

    async function apply(catfish: number, prompt: number, chat: number, vote: number) {
    try {
      await applyLobbySettings({ code: lobbyCode, catfishNumber: catfish, promptTimer: prompt, chatTimer: chat, voteTimer: vote});
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
  <Dialog
    bind:open={showLobbySettings}
    fullscreen
    aria-labelledby="rules-dialog-title"
    aria-describedby="rules-dialog-content"
    ><Header>
      <Title id="lobby-settings-title">Lobby Settings</Title>
      <IconButton action="close" class="material-icons">close</IconButton>
    </Header>
    <Content>
      <p>Where settings will be</p>

      <div class="settings">
        <p>This will be something for catfish number</p>

        {#each configurableTimers as state}
          <FormField align="end">
            <Slider
              min={minimumTimes.get(state)}
              max={maximumTimes.get(state)}
              step={5}
              discrete
              input$aria-label="Discrete slider"
            />
            <span slot="label">{sliderLabels.get(state)}</span>
          </FormField>
        {/each}

        <Button on:click={() => apply(0, 0, 0, 0)}><Label>Apply Settings</Label></Button>
      </div>
    </Content>
  </Dialog>
  <Button
    on:click={() => {
      showLobbySettings = true;
    }}
    class="Lobby Settings"><Label>Lobby Settings</Label></Button
  >
</main>

<style>
  .settings {
    width: 100%;
    display: grid;
    place-items: center;
  }
</style>
