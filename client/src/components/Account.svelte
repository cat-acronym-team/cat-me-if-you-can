<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import { authStore as user } from "$stores/auth";
  import { logOut } from "$lib/firebase/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import SignInButtons from "./SignInButtons.svelte";

  export let userData: UserData | undefined;
  let showSignInDialog = false;
  let menu: Menu;
</script>

<!-- Sign In Modal -->
<Dialog bind:open={showSignInDialog} aria-labelledby="signin-dialog-title" aria-describedby="signin-dialog-content">
  <Header>
    <Title id="signin-dialog-title">Sign In</Title>
  </Header>
  <Content id="signin-dialog-content">
    <!--Put Sign In component here-->
    <SignInButtons bind:showSignInDialog />
  </Content>
</Dialog>
<div class="account-container">
  <!-- If you are not signed in show this  -->
  {#if $user == null}
    <Button on:click={() => (showSignInDialog = true)}><Label>Sign in</Label></Button>
    <!-- If you show account and dropdown -->
  {:else}
    <Button on:click={() => menu.setOpen(true)}><Label>Account</Label></Button>
    <Menu bind:this={menu}>
      <List>
        <Item tag="a" href="/settings"><Text>Account Settings</Text></Item>
        {#if userData != undefined}
          <Item tag="a" href="/stats?user={$user.uid}"><Text>Stats</Text></Item>
        {/if}
        <Separator />
        <Item on:SMUI:action={logOut}><Text>Logout</Text></Item>
      </List>
    </Menu>
  {/if}
</div>

<style>
  .account-container {
    position: relative;
    display: inline-block;
  }

  :global(#sign-in-with-google),
  :global(#sign-in-with-microsoft),
  :global(#sign-in-with-email),
  :global(#sign-up-with-email) {
    --mdc-typography-button-text-transform: none;
    justify-content: start;
    gap: 4px;
  }

  :global(#sign-in-with-google),
  :global(#sign-in-with-microsoft) {
    --mdc-theme-primary: #ffffff;
    --mdc-theme-on-primary: #3c4043;
  }

  @media (prefers-color-scheme: dark) {
    :global(#sign-in-with-microsoft) {
      --mdc-theme-primary: #2f2f2f;
      --mdc-theme-on-primary: #ffffff;
    }
  }
</style>
