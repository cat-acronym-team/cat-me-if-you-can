<script lang="ts">
  import FullScreenTransition from "./FullScreenTransition.svelte";
  import type { Lobby, PrivatePlayer, Role } from "$lib/firebase/firestore-types/lobby";
  import catWinImage from "$lib/images/winloss/cat-win.webp";
  import catLossImage from "$lib/images/winloss/cat-loss.webp";
  import catfishWinImage from "$lib/images/winloss/catfish-win.webp";
  import catfishLossImage from "$lib/images/winloss/catfish-loss.webp";

  export let lobby: Lobby;
  export let privatePlayer: PrivatePlayer;

  let catfishList: string = "";
  let catfishes: string[];

  // format a string list to have commas and "and" when needed
  const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
  // get the list of catfishes from lobby.ts and put them into a variable
  $: catfishes = Object.values(lobby.players)
    .filter((p) => {
      return p.role == "CATFISH";
    })
    .map((c) => c.displayName);
  $: catfishList = formatter.format(catfishes);

  function were(): string {
    // Check the number of catfish for grammar purposes
    if (catfishes.length > 1) {
      return "were";
    } else {
      return "was";
    }
  }

  function have(): string {
    // Check the number of catfish for grammar purposes
    if (catfishes.length > 1) {
      return "have";
    } else {
      return "has";
    }
  }

  /**
   * what should be displayed for each combination of current player role and game winner
   */
  const STATES: {
    [player in Role]: {
      [winner in "CAT" | "CATFISH"]: {
        banner: string;
        imageSrc: string;
        description: string;
      };
    };
  } = {
    CAT: {
      CAT: {
        banner: "Hooray!<br />You have sniffed out the cat fish!",
        imageSrc: catWinImage,
        get description() {
          return `${catfishList} ${were()} sentenced to 9 lives in purrison!`;
        },
      },
      CATFISH: {
        banner: "You have cat to be kitten me!",
        imageSrc: catLossImage,
        get description() {
          return `${catfishList} ${have()} taken over the litter!`;
        },
      },
    },
    CATFISH: {
      CAT: {
        banner: "You have been caught (and released)!<br />Might as well have been a <b>clown</b> fish...",
        imageSrc: catfishLossImage,
        description: "You should go back to your sea ani-anim-aneme... home",
      },
      CATFISH: {
        banner: "O-fish-ally the greatest!<br />Way to deceive your furry friends!",
        imageSrc: catfishWinImage,
        description: "You have successfully taken over the litter!",
      },
    },
    SPECTATOR: {
      CAT: {
        banner: "The cats have sniffed out the catfish!",
        imageSrc: catWinImage,
        description: "You will be able to join the next game!",
      },
      CATFISH: {
        get banner() {
          return `The impawsters ${were()} not caught!`;
        },
        imageSrc: catfishWinImage,
        description: "You will be able to join the next game!",
      },
    },
  };

  $: state = STATES[privatePlayer.role][lobby.winner as "CAT" | "CATFISH"];
</script>

<FullScreenTransition imageSrc={state.imageSrc} imageAlt="">
  <svelte:fragment slot="banner">{@html state.banner}</svelte:fragment>
  <svelte:fragment slot="description">{state.description}</svelte:fragment>
</FullScreenTransition>
