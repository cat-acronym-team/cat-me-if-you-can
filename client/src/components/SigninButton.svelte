<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import { Svg, Icon } from "@smui/common";
  import { authStore as user } from "$stores/auth";

  const googleSvgPaths: { color: string; path: string }[] = [
    {
      color: "#EA4335",
      path: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z",
    },
    {
      color: "#4285F4",
      path: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z",
    },
    {
      color: "#FBBC05",
      path: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z",
    },
    {
      color: "#34A853",
      path: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z",
    },
  ];

  // check if the user is logged in with getAuth
  let showSignInDialog = false;
</script>

<!-- Sign In Modal -->
<Dialog bind:open={showSignInDialog} aria-labelledby="signin-dialog-title" aria-describedby="signin-dialog-content">
  <Header>
    <Title id="signin-dialog-title">Sign In</Title>
  </Header>
  <Content id="signin-dialog-content">
    <!-- TODO: Sign In Modal Content Here -->
    <div class="buttons">
      <Button id="sign-in-with-google" variant="raised">
        <Icon component={Svg} viewBox="0 0 48 48">
          {#each googleSvgPaths as path}
            <path fill={path.color} d={path.path} />
          {/each}
        </Icon>
        <Label>Sign in with Google</Label>
      </Button>
      <Button id="sign-in-with-microsoft" variant="raised">
        <Icon component={Svg} viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </Icon>
        <Label>Sign in with Microsoft</Label>
      </Button>
    </div>
  </Content>
</Dialog>
<div class="account-container">
  <!-- If you are not signed in show this  -->
  {#if $user == null}
    <Button on:click={() => (showSignInDialog = true)}><Label>Sign in</Label></Button>
    <!-- If you show account and dropdown -->
  {:else}
    <Button><Label>Account</Label></Button>
    <!-- Hover doesn't work on mobile -->
    <div class="account-content">
      <!-- TODO: Account Hover Links -->
      <!-- <a href="/settings">Account Settings</a>
        <a href="/stats">Stats</a>
        <a href="/logout">Logout</a> -->
    </div>
  {/if}
</div>

<style>
  .account-container {
    position: relative;
    display: inline-block;
  }

  .account-content {
    display: none;
    position: absolute;
    right: 5px;
    background-color: #151515;
    min-width: 160px;
    /* box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2); */
    z-index: 1;
  }

  .account-container:hover .account-content {
    display: block;
  }

  .buttons {
    display: grid;
    justify-content: center;
    gap: 12px;
  }

  :global(#sign-in-with-google),
  :global(#sign-in-with-microsoft) {
    --mdc-theme-primary: #ffffff;
    --mdc-theme-on-primary: #3c4043;
    --mdc-typography-button-text-transform: none;
    justify-content: start;
    gap: 4px;
  }

  @media (prefers-color-scheme: dark) {
    :global(#sign-in-with-microsoft) {
      --mdc-theme-primary: #2f2f2f;
      --mdc-theme-on-primary: #ffffff;
    }
  }
</style>
