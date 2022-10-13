<script lang="ts" context="module">
  import type { Player } from "$lib/firebase/firestore-types/lobby";
  import { onMount } from "svelte";
  import { createChatRoom } from "$lib/firebase/chat";
  /*
  Expect players from lobby page
  Pair those players up randomly
  Enter those players into a chat room 
   - they are able to see their answers to the prompt
   - they are able to message back and forward
   - empty messages aren't allowed
   - able to see incoming messages (IDK!! IS THIS VERSION 1 OR 2)
   - show error message if message is invalid
  Display a timer for how long they can chat
  After chat phase is over delete the document
  */
  export let players: Player[];
  export let uids: string[];

  export type ChatRoomAssocation = {
    [index: string]: { one: string; two: string };
  };
  let stalker: string;
  let pairs: { one: string; two: string }[];
  let chatroomIds: ChatRoomAssocation;
  onMount(() => {
    // Create Pairs
    // Check if there are even or odd number of players
    const tempUids = [...uids];
    if (tempUids.length % 2 !== 0) {
      while (tempUids.length !== 1) {
        // get random pair
        let pairOne = tempUids[Math.floor(Math.random() * tempUids.length)];
        let pairTwo = tempUids[Math.floor(Math.random() * tempUids.length)];
        // generate a random player if the current pairs are equal
        while (pairOne === pairTwo) {
          pairTwo = tempUids[Math.floor(Math.random() * tempUids.length)];
        }
        // organize the pairs
        pairs.push({ one: pairOne, two: pairTwo });
        // delete them from temp array
        tempUids.splice(tempUids.indexOf(pairOne), 1);
        tempUids.splice(tempUids.indexOf(pairTwo), 1);
      }
      // the last person in the temp uids will be the stalker
      stalker = tempUids[0];
    }
    // even number of players
    else {
      while (tempUids.length !== 0) {
        // get random pair
        let pairOne = tempUids[Math.floor(Math.random() * tempUids.length)];
        let pairTwo = tempUids[Math.floor(Math.random() * tempUids.length)];
        // generate a random player if the current pairs are equal
        while (pairOne === pairTwo) {
          pairTwo = tempUids[Math.floor(Math.random() * tempUids.length)];
        }
        // organize the pairs
        pairs.push({ one: pairOne, two: pairTwo });
        // delete them from temp array
        tempUids.splice(tempUids.indexOf(pairOne), 1);
        tempUids.splice(tempUids.indexOf(pairTwo), 1);
      }
    }

    // Once pairs are generated then assocate chatroom ids to pairs
    pairs.forEach(async ({ one, two }) => {
      const chatRoomId = await createChatRoom([one, two]);
      chatroomIds[chatRoomId] = { one, two };
    });
  });
</script>
