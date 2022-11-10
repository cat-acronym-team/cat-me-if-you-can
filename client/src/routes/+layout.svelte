<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import IconButton from "@smui/icon-button";
  import Dialog, { Header, Title, Content } from "@smui/dialog";

  let showRulesDialog = false;
</script>

<Dialog
  bind:open={showRulesDialog}
  fullscreen
  aria-labelledby="rules-dialog-title"
  aria-describedby="rules-dialog-content"
>
  <Header>
    <Title id="rules-dialog-title">Rules!</Title>
    <IconButton action="close" class="material-icons">close</IconButton>
  </Header>
  <Content id="rules-dialog-content">
    <div class="mdc-typography--headline6"><u>Setting:</u></div>
    <div class="mdc-typography--body1">
      You are a very lonely cat, looking for another furry friend so you decide to try out online dating. In comes a
      brand new, top-of-the-line dating app, Cat Me if You Can! You’ve heard great things about the world of online
      dating and other cats instantly finding matches from other cats with owners from all across the world. Everything
      is great except for those slimy catfish that try to swim their way through this cat-only dating app and deceive
      all the innocent other cats. Your job is to remove these pesky catfish from the app and keep the app fish-free.<br
      />
    </div>

    <div class="mdc-typography--headline6"><u>Recommendation:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>Play the game while being able to speak with other players.</li>
        <li>Do not talk to other players during the game until the voting phase has arrived.</li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>Phases:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>Lobby</li>
        <li>Recieve A Role</li>
        <li>Answer Prompt</li>
        <li>Chatting</li>
        <li>Voting</li>
        <li>End</li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>Before the game:</u></div>
    <div class="mdc-typography--body1">
      If you have an account/want to create one, head to the sign-in button and enter your information to create an
      account. Don’t want to create an account? Just enter your display name and choose either <i>Create Lobby</i> or
      <i>Join Lobby</i> to continue.<br />
    </div>

    <div class="mdc-typography--headline6"><u>Lobby:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>
          One player is in charge of being the host of the lobby and will click the <i>Create Lobby</i> button upon entering.
        </li>
        <li>
          Every other player may join the lobby via a game link shared by the hosts or by clicking the <i>Join Lobby</i>
          button and entering the code associated with the lobby.
        </li>
        <li>
          If you are currently in a voice call with other players, do not talk to other players (or mute microphone)
          until the voting phase has arrived.
        </li>
        <li>Be sure to select your favorite cat and be ready for the host to start the game.</li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>Receive a Role:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>Every player is given one of two roles: <i>Cat</i> or <i>Catfish.</i></li>
        <li>
          <b>Cats: </b>
          <ul>
            <li>
              Your job is to find the mischievous player(s) that are trying to deceive the other cats (and probably scam
              you). Remove all the catfish from the app to win the game!
            </li>
            <li>Answer prompts and chat with others while defending yourself as a true kitty cat.</li>
          </ul>
        </li>
        <li>
          <b>Catfish: </b>
          <ul>
            <li>Your job is to bamboozle the other cats and claim yourself as part of the group.</li>
            <li>
              Beware! The prompts you receive are not like your feline friends so prepare to defend yourself in the
              chatting phase and voting phase!
            </li>
            <li>
              Get the cats to betray each other and vote each other out. If there is only one cat left, congrats! You’ve
              tricked enough cats to kick each other out and now the lonely cat has to be your mate!
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>Answer Prompt:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>
          Each player is given an icebreaker (ex. What is your favorite food?) and will be able to answer it underneath
          the question.
        </li>
        <li>
          All cats will receive the same icebreaker, but catfish will receive a slightly different icebreaker (ex. What
          is your least favorite food?) that they must answer as well.
        </li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>Chatting:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>
          Each player will find a match with another player. Upon matching, you will see each other’s answers to the
          prompt.
        </li>
        <li>Cats must try to find any fishy answers that don’t make sense with the given icebreaker.</li>
        <li>
          Catfish, defend yourself. Make excuses, lie, and find any way to convince your partner that your answer fits
          their icebreaker.
        </li>
        <li>
          Have an odd number of players and couldn’t find a match? Good thing this is a loner-free zone! Take your
          vengeance on another couple and stalk their date as they have a great time without you! Unaccompanied players
          will get a new menu that will allow them to select any current pair and will be able to watch over their
          current chat.
        </li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>Voting:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>
          After (hopefully) all players have had their fun on their dates and everyone’s inner Purrlock Holmes has
          activated, players will now be able to talk to each other to report what they have witnessed.
        </li>
        <li>During this phase, the answers to the icebreakers for every player will be shown.</li>

        <li><b>Cats: </b>find any answer you find to be strange and call out your fishy prey.</li>
        <li>
          <b>Catfish:</b> your furry feline friends are on the hunt to remove you from the app. Defend your answer amongst
          the group, call out other cats, or stay completely silent. Do whatever you can to survive the round and not be
          voted out.
        </li>
        <li>
          Once a player feels that they know who they want removed, they may click on the player to cast a vote on them.
          Catfish, try to blend in and vote out any cats that are being backstabbed.
        </li>
        <li>
          Once the timer has ended, the player with the most votes will be kicked from the current chat session and will
          have to spectate the rest of the players.
        </li>
      </ul>
    </div>

    <div class="mdc-typography--headline6"><u>End:</u></div>
    <div class="mdc-typography--body1">
      <ul>
        <li>Every player is given one of two roles: <i>Cat</i> or <i>Catfish.</i></li>
        <li>
          The game will come to an end with one of two scenarios:
          <ul>
            <li>
              <b>Scenario 1: </b>There are zero catfish remaining.
            </li>
            <li><b>Scenario 2: </b>The number of cats are equal to the number of catfish.</li>
          </ul>
        </li>
        <li>Scenario 1 will result in the cats winning. The app is now fish-free!</li>
        <li>Scenario 2 will result in the catfish winning and cats dropping lower in the food chain…</li>
      </ul>
    </div>
  </Content>
</Dialog>

<div class="top-left">
  <IconButton class="material-icons" on:click={() => (showRulesDialog = true)}>help</IconButton>
</div>

<slot />

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    height: 100dvh;
  }

  .top-left {
    position: absolute;
    top: 8px;
    left: 8px;
  }

  ul {
    padding-left: 24px;
    margin: 0;
  }
</style>
