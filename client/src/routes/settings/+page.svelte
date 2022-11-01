<script lang="ts">
  import { deleteAccount, linkUserCredentials, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import Dialog, { Title, Header, Content, Actions, InitialFocus } from "@smui/dialog";
  import Button, { Label } from "@smui/button";

  let showDeletionPrompt = false;
  let password: string = "";
  let confirmPass = "";
  let errorMsg = "";
  let success = false;
  let linkPassButton = false;
  let errPrompt = false;

  function outPutErrorMsg() {
    switch (errorMsg) {
      case "auth/account-exists-with-different-credential":
        errorMsg = "Account currently exists with different credentials";
        return;
      default:
        return;
    }
  }

  function clearFields() {
    password = "";
    confirmPass = "";
  }

  function linkPassPrompt() {
    errorMsg = "";
    linkPassButton = true;
  }

  function verifyDelete() {
    try {
      deleteAccount();
      // If no error
      errorMsg = "";
      goto("/");
      return;
    } catch (err) {
      errPrompt = true;
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  async function linkCredentials() {
    if (password != confirmPass) {
      password = "";
      confirmPass = "";
      errorMsg = "Password do not match";
      return;
    }

    try {
      await linkUserCredentials(password);
      errorMsg = "";
      success = true;
      linkPassButton = false;
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      outPutErrorMsg();
      return;
    }
  }
</script>

<html lang="en">
  <h2>Account Settings</h2>
  <main>
    <div class="wrapper">
      <!--Delete Account Button and Prompt-->
      <Dialog
        bind:open={showDeletionPrompt}
        aria-labelledby="confirm-account-deletion-title"
        aria-describedby="deletion-confirmation-content"
      >
        <Header>
          <Title id="confirm-account-deletion-title">Delete Account</Title>
        </Header>
        <Content id="deletion-confirmation-content">Are you sure?</Content>
        <Actions>
          <Button id="dont-delete-account">
            <Label>No</Label>
          </Button>
          <Button
            id="confirm-delete-account"
            on:click={() => {
              verifyDelete();
            }}
          >
            <Label>Yes</Label>
          </Button>
        </Actions>
      </Dialog>
      <!--If user signed in too long ago, redirect them to sign in-->
      {#if errorMsg !== ""}
        <Dialog bind:open={errPrompt} aria-labelledby="reauth-title" aria-describedby="err-msg-content">
          <Title id="reauth-title">NOTICE!</Title>
          <Content id="err-msg-content"
            >Last sign in too long ago.
            <br />Click ok to be redirected back to sign in</Content
          >
          <Actions>
            <Button
              defaultAction
              use={[InitialFocus]}
              on:click={() => {
                logOut();
                goto("/");
              }}
              ><Label>Ok</Label>
            </Button>
          </Actions>
        </Dialog>
      {/if}
      <div class="item-link-pass">
        <h3>Link Password</h3>
        <Button on:click={linkPassPrompt} on:click={clearFields}>
          <Label>Link Credentials</Label>
        </Button>
        <!--If button is clicked, show block-->
        {#if linkPassButton}
          <form class="formContainer" on:submit|preventDefault={linkCredentials}>
            <Label for="password">Password</Label>
            <div class="passForm">
              <input
                id="password"
                bind:value={password}
                type="password"
                placeholder="Enter Password"
                name="password"
                required
              />
            </div>
            <div class="passForm">
              <Label for="confpass">Confirm Password</Label>
              <input
                id="confirmpass"
                bind:value={confirmPass}
                type="password"
                placeholder="Confirm Password"
                name="confpass"
                required
              />
            </div>
            {#if errorMsg !== ""}
              <p class="error">{errorMsg}</p>
            {/if}
            <div class="formButton">
              <Button type="submit">
                <Label>Link Password</Label>
              </Button>
            </div>
          </form>
        {/if}
        {#if success == true}
          <p>Password Linked Successfully</p>
        {/if}
      </div>
      <div class="item-change-pass">
        <Button>
          <Label>Change Password</Label>
        </Button>
      </div>
      <!--EOF Delete Account Button and Prompt-->
      <!--Signout button-->
      <div class="item-signout">
        <Button
          on:click={() => {
            logOut();
            goto("/");
          }}
        >
          <Label>Sign Out</Label>
        </Button>
      </div>
      <!--End Signout button-->
      <div class="item-del-account">
        <Button on:click={() => (showDeletionPrompt = true)}>
          <Label>Delete Account</Label>
        </Button>
      </div>
    </div>
  </main>
</html>

<style>
  .wrapper {
    display: grid;
    display: inline-grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    row-gap: 15px;
  }

  .item-link-pass {
    grid-column: 1;
  }
  .item-change-pass {
    grid-column: 1;
    grid-row: 2;
    height: auto;
    width: 100%;
  }

  .item-signout {
    grid-column: 1;
    grid-row: 3;
    height: auto;
    width: 100%;
  }

  .item-del-account {
    grid-column: 1;
    grid-row: 4;
    height: auto;
    width: 100%;
  }

  .passForm {
    margin-bottom: 5px;
  }

  .error {
    color: red;
  }
</style>
