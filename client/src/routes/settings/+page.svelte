<script lang="ts">
  import { deleteAccount, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import Dialog, { Title, Header, Content, Actions, InitialFocus } from "@smui/dialog";
  import Button, { Label } from "@smui/button";

  let showDeletionPrompt = false;
  let errorMsg = "";
  let errPrompt = false;

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
</script>

<html lang="en">
  <h2>Account Settings</h2>
  <main>
    <div>
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
            <Label>Cancel</Label>
          </Button>
          <Button id="confirm-delete-account" on:click={verifyDelete}>
            <Label>Delete Account</Label>
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

      <Button class="item-del-account" on:click={() => (showDeletionPrompt = true)}>
        <Label>Delete Account</Label>
      </Button>
    </div>
  </main>
</html>

<style>
</style>
