<script lang="ts">
  import IconButton from "@smui/icon-button";
  import Menu from "@smui/menu";
  import List, { Item, Text } from "@smui/list";
  import { kick, ban } from "$lib/firebase/firebase-functions";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { authStore as user } from "$stores/auth";

  // variables
  let menu: Menu;

  export let lobbyCode: string;
  export let uid: string;
  export let lobby: Lobby;
</script>

<div id="icon-id">
  <IconButton class="material-icons" on:click={() => menu.setOpen(true)}>more_vert</IconButton>
  <Menu bind:this={menu}>
    <List>
      {#if $user !== null}
        {#if lobby.uids[0] === $user.uid}
          <Item on:SMUI:action={() => kick({ code: lobbyCode, uid: uid })}>
            <Text>Kick</Text>
          </Item>
          <Item on:SMUI:action={() => ban({ code: lobbyCode, uid: uid })}>
            <Text>Ban</Text>
          </Item>
        {/if}
      {/if}
      <Item tag="a" href="/stats?user={uid}" target="_blank" rel="noreferrer noopener">
        <Text>Stats</Text>
      </Item>
    </List>
  </Menu>
</div>

<style>
  * {
    box-sizing: border-box;
  }

  #icon-id {
    position: absolute;
    right: 0px;
  }
</style>
