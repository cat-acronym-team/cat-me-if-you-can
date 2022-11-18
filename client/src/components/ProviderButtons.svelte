<script lang="ts">
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import { Svg, Icon } from "@smui/common";
  import Button, { Label } from "@smui/button";
  import { createEventDispatcher } from "svelte";

  export let errorMessage: string;
  export let selectedForm: "SIGN_IN" | "SIGN_UP" | "NONE";
  export let email: string;
  export let password: string;
  export let showPassword: boolean;
  export let compLocation: string;

  let dispatch = createEventDispatcher();

  function googleLogin() {
    dispatch("googleClicked");
  }

  function microsoftLogin() {
    dispatch("microsoftClicked");
  }

  function createAccount() {
    dispatch("createAccountClicked");
  }

  function submitLogin() {
    dispatch("submitLoginClicked");
  }

  function signInDropDown() {
    dispatch("signInDropDownClicked");
  }

  function createAccountDropDown() {
    dispatch("createAccountDropDownClicked");
  }

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
</script>

<div class="buttons">
  <Button id="sign-in-with-google" variant="raised" on:click={googleLogin}>
    <Icon component={Svg} viewBox="0 0 48 48">
      {#each googleSvgPaths as path}
        <path fill={path.color} d={path.path} />
      {/each}
    </Icon>
    <Label>Sign in with Google</Label>
  </Button>
  <Button id="sign-in-with-microsoft" variant="raised" on:click={microsoftLogin}>
    <Icon component={Svg} viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </Icon>
    <Label>Sign in with Microsoft</Label>
  </Button>
  {#if compLocation == "sign-in"}
    <Button id="sign-in-with-email" variant="raised" on:click={signInDropDown}>
      <Icon class="material-icons">email</Icon>
      <Label>Sign in with email</Label>
    </Button>
    <Button id="sign-up-with-email" variant="raised" on:click={createAccountDropDown}>
      <Icon class="material-icons">email</Icon>
      <Label>Sign up with email</Label>
    </Button>
    {#if selectedForm != "NONE"}
      <form on:submit|preventDefault={selectedForm == "SIGN_IN" ? submitLogin : createAccount}>
        <Textfield label="Email" type="email" bind:value={email} required input$autocomplete="username" />
        <Textfield
          label="Password"
          type={showPassword ? "text" : "password"}
          bind:value={password}
          required
          input$autocomplete={selectedForm == "SIGN_IN" ? "current-password" : "new-password"}
        >
          <IconButton
            type="button"
            on:click={(event) => event.preventDefault()}
            slot="trailingIcon"
            toggle
            bind:pressed={showPassword}
          >
            <Icon class="material-icons" on>visibility</Icon>
            <Icon class="material-icons">visibility_off</Icon>
          </IconButton>
        </Textfield>
        {#if errorMessage !== ""}
          <p class="error">{errorMessage}</p>
        {/if}
        <Button type="submit">
          <Label>{selectedForm == "SIGN_IN" ? "Sign In" : "Sign Up"}</Label>
        </Button>
      </form>
    {/if}
  {/if}
</div>

<style>
  .buttons {
    display: grid;
    justify-content: center;
    gap: 12px;
  }

  form {
    display: grid;
    gap: 12px;
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