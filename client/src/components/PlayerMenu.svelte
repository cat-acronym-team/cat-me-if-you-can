<script lang="ts">
  import IconButton from "@smui/icon-button";
  import Menu from "@smui/menu";
  import List, { Item, Text } from "@smui/list";
  import { kick, ban } from "$lib/firebase/firebase-functions";

  // variables
  let menu: Menu;

  export let lobbyCode: string | undefined = undefined;
  export let uid: string | undefined = undefined;
</script>

<div id="icon-id">
  <IconButton class="material-icons" on:click={() => menu.setOpen(true)}>more_vert</IconButton>
  <Menu bind:this={menu}>
    <List>
      <Item on:SMUI:action={() => kick({ code: lobbyCode ?? "", uid: uid ?? "" })}>
        <Text>Kick</Text>
      </Item>
      <Item on:SMUI:action={() => ban({ code: lobbyCode ?? "", uid: uid ?? "" })}>
        <Text>Ban</Text>
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
  /* absolute position relative to  */
</style>
